import "server-only"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { getApprovalRecipient, isResendConfigured, sendEmail } from "@/lib/email/resend"

export const ACCESS_REQUESTS_COLLECTION = "access_requests"

export type AccessRequestInput = {
  discordId: string
  username: string
  avatar?: string | null
}

/** Builds the approval email HTML for a pending manager access request. */
function approvalEmailHtml(input: AccessRequestInput, requestId: string): string {
  return `
  <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;margin:0 auto;background:#0d1017;color:#e6e9f0;border:1px solid #232a3a;border-radius:16px;overflow:hidden">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#141a2b,#0d1017);border-bottom:1px solid #232a3a">
      <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7aa6ff">Invisiber&apos;s Domain</p>
      <h1 style="margin:8px 0 0;font-size:22px;color:#fff">Manager Access Request</h1>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 16px;line-height:1.6;color:#aeb6c7">
        A Discord user attempted to sign in to the Manager Portal but is not on the authorized list.
        Review the details below and, if approved, add their Discord ID to the authorized managers list.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:8px 0;color:#7c8598;width:130px">Username</td>
          <td style="padding:8px 0;color:#e6e9f0;font-weight:600">${escapeHtml(input.username)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#7c8598">Discord ID</td>
          <td style="padding:8px 0;color:#e6e9f0;font-family:ui-monospace,monospace">${escapeHtml(input.discordId)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#7c8598">Request ID</td>
          <td style="padding:8px 0;color:#e6e9f0;font-family:ui-monospace,monospace">${escapeHtml(requestId)}</td>
        </tr>
      </table>
      <p style="margin:20px 0 0;padding:14px 16px;background:#141a2b;border:1px solid #232a3a;border-radius:10px;font-size:13px;line-height:1.6;color:#aeb6c7">
        To grant access, add <span style="font-family:ui-monospace,monospace;color:#7aa6ff">${escapeHtml(input.discordId)}</span>
        to <span style="font-family:ui-monospace,monospace">AUTHORIZED_MANAGERS</span> in <span style="font-family:ui-monospace,monospace">lib/auth/config.ts</span>.
      </p>
    </div>
  </div>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Records an unauthorized manager login attempt in the `access_requests`
 * collection and emails the approval recipient via Resend.
 *
 * Failures are swallowed (logged only) so they never block the auth redirect.
 */
export async function recordAccessRequest(input: AccessRequestInput): Promise<void> {
  let requestId = "unknown"

  try {
    const db = getAdminDb()
    const ref = await db.collection(ACCESS_REQUESTS_COLLECTION).add({
      discordId: input.discordId,
      username: input.username,
      avatar: input.avatar ?? null,
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
    await sendEmail({
      to: getApprovalRecipient(),
      subject: `Manager access request — ${input.username}`,
      html: approvalEmailHtml(input, requestId),
    })
  } catch (error) {
    console.error("[v0] Failed to send access-request email:", error)
  }
}
