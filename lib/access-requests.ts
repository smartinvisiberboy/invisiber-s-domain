import "server-only"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { getApprovalRecipient, isResendConfigured, sendEmail } from "@/lib/email/resend"
import { ACCESS_REQUESTS_COLLECTION } from "@/lib/security/collections"
import { createActionToken } from "@/lib/security/action-token"
import { addAuthorizedManager, logAudit } from "@/lib/security/store"
import type { RequestMeta } from "@/lib/security/meta"
import { OWNER_ID } from "@/lib/auth/config"

export { ACCESS_REQUESTS_COLLECTION }

export type AccessRequestInput = {
  discordId: string
  username: string
  displayName?: string | null
  avatar?: string | null
  email?: string | null
  meta: RequestMeta
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function row(label: string, value: string, mono = false): string {
  const font = mono ? "font-family:ui-monospace,monospace;" : ""
  return `
    <tr>
      <td style="padding:8px 0;color:#7c8598;width:150px;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#e6e9f0;font-weight:600;${font}word-break:break-word">${escapeHtml(value)}</td>
    </tr>`
}

/** Builds the approval email HTML with all collected details and two action buttons. */
function approvalEmailHtml(
  input: AccessRequestInput,
  requestId: string,
  approveUrl: string,
  rejectUrl: string,
): string {
  return `
  <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;background:#0d1017;color:#e6e9f0;border:1px solid #232a3a;border-radius:16px;overflow:hidden">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#141a2b,#0d1017);border-bottom:1px solid #232a3a">
      <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7aa6ff">Invisiber&apos;s Domain</p>
      <h1 style="margin:8px 0 0;font-size:22px;color:#fff">&#128680; New Manager Access Request</h1>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 16px;line-height:1.6;color:#aeb6c7">
        A Discord user attempted to enter the Manager Portal but is not authorized.
        Access is <strong style="color:#fca5a5">denied by default</strong>. Approve only if you recognize this person.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row("Username", input.username)}
        ${row("Display Name", input.displayName || input.username)}
        ${row("Discord ID", input.discordId, true)}
        ${row("Email", input.email || "Not shared")}
        ${row("Country", input.meta.country)}
        ${row("IP Hash", input.meta.ipHash, true)}
        ${row("Browser / Device", input.meta.userAgent)}
        ${row("Attempted Route", input.meta.route, true)}
        ${row("Request ID", requestId, true)}
      </table>
      <div style="margin:28px 0 8px;display:flex;gap:12px">
        <a href="${approveUrl}" style="flex:1;display:inline-block;text-align:center;padding:13px 18px;background:#16a34a;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">&#9989; Approve Access</a>
        <a href="${rejectUrl}" style="flex:1;display:inline-block;text-align:center;padding:13px 18px;background:#dc2626;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">&#10060; Reject Access</a>
      </div>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#7c8598">
        These links are single-purpose and expire in 7 days. Only you received this email, so only you can approve or reject. If you do nothing, access stays denied.
      </p>
    </div>
  </div>`
}

/**
 * Records an unauthorized manager login attempt with full metadata in the
 * `access_requests` collection and emails the owner an approval request with
 * secure Approve / Reject action buttons.
 *
 * Failures are swallowed (logged only) so they never block the auth redirect.
 */
export async function recordAccessRequest(input: AccessRequestInput, baseUrl: string): Promise<void> {
  let requestId = "unknown"

  try {
    const db = getAdminDb()
    const ref = await db.collection(ACCESS_REQUESTS_COLLECTION).add({
      discordId: input.discordId,
      username: input.username,
      displayName: input.displayName ?? null,
      avatar: input.avatar ?? null,
      email: input.email ?? null,
      ipHash: input.meta.ipHash,
      userAgent: input.meta.userAgent,
      country: input.meta.country,
      attemptedRoute: input.meta.route,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    })
    requestId = ref.id
  } catch (error) {
    console.error("[v0] Failed to record access request:", error)
  }

  if (!isResendConfigured()) {
    console.warn("[v0] Resend not configured — skipping access-request email.")
    return
  }

  try {
    const approveToken = createActionToken({
      requestId,
      discordId: input.discordId,
      action: "approve",
    })
    const rejectToken = createActionToken({
      requestId,
      discordId: input.discordId,
      action: "reject",
    })
    const approveUrl = `${baseUrl}/api/manager/access?token=${encodeURIComponent(approveToken)}`
    const rejectUrl = `${baseUrl}/api/manager/access?token=${encodeURIComponent(rejectToken)}`

    await sendEmail({
      to: getApprovalRecipient(),
      subject: `🚨 New Manager Access Request — ${input.username}`,
      html: approvalEmailHtml(input, requestId, approveUrl, rejectUrl),
    })
  } catch (error) {
    console.error("[v0] Failed to send access-request email:", error)
  }
}

/* -------------------------------------------------------------------------- */
/*  Owner decisions (invoked from the signed email action links)             */
/* -------------------------------------------------------------------------- */

const OWNER_ACTOR = { discordId: OWNER_ID, username: "Owner" }

/** Approves a pending request: grants the manager role and records the audit trail. */
export async function approveAccessRequest(requestId: string, discordId: string): Promise<void> {
  const db = getAdminDb()
  let username: string | null = null

  try {
    const snap = await db.collection(ACCESS_REQUESTS_COLLECTION).doc(requestId).get()
    username = (snap.data()?.username as string | undefined) ?? null
  } catch {
    // best effort
  }

  await addAuthorizedManager(discordId, { username }, OWNER_ACTOR)
  try {
    await db.collection(ACCESS_REQUESTS_COLLECTION).doc(requestId).update({
      status: "approved",
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: OWNER_ACTOR.username,
    })
  } catch (error) {
    console.error("[v0] Failed to update access request on approve:", error)
  }
  await logAudit({ actor: OWNER_ACTOR, action: "Approve Manager", targetId: discordId })
}

/** Rejects a pending request: keeps access denied and records the audit trail. */
export async function rejectAccessRequest(requestId: string, discordId: string): Promise<void> {
  const db = getAdminDb()
  try {
    await db.collection(ACCESS_REQUESTS_COLLECTION).doc(requestId).update({
      status: "rejected",
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: OWNER_ACTOR.username,
    })
  } catch (error) {
    console.error("[v0] Failed to update access request on reject:", error)
  }
  await logAudit({ actor: OWNER_ACTOR, action: "Reject", targetId: discordId })
}
