import "server-only"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { isOwner } from "@/lib/auth/config"
import {
  AUDIT_LOGS_COLLECTION,
  AUTHORIZED_MANAGERS_COLLECTION,
  BLOCKED_USERS_COLLECTION,
  SECURITY_LOGS_COLLECTION,
  type AuditAction,
} from "./collections"
import type { RequestMeta } from "./meta"

/* -------------------------------------------------------------------------- */
/*  Blocklist                                                                 */
/* -------------------------------------------------------------------------- */

/** Returns true when a Discord ID is on the permanent blocklist. The Owner can never be blocked. */
export async function isBlocked(discordId: string): Promise<boolean> {
  if (isOwner(discordId)) return false
  try {
    const doc = await getAdminDb().collection(BLOCKED_USERS_COLLECTION).doc(discordId).get()
    return doc.exists
  } catch (error) {
    console.error("[v0] Blocklist lookup failed:", error)
    // Fail closed only for auth decisions is safer, but a lookup outage should
    // not permanently lock out legitimate managers; deny-by-default is enforced
    // elsewhere, so we treat an error here as "not blocked".
    return false
  }
}

export async function blockUser(
  discordId: string,
  actor: { discordId: string; username: string },
  reason?: string,
): Promise<void> {
  if (!isOwner(actor.discordId)) throw new Error("Only the Owner may block users.")
  if (isOwner(discordId)) throw new Error("The Owner cannot be blocked.")
  await getAdminDb()
    .collection(BLOCKED_USERS_COLLECTION)
    .doc(discordId)
    .set({
      discordId,
      reason: reason ?? null,
      blockedBy: actor.username,
      blockedById: actor.discordId,
      createdAt: FieldValue.serverTimestamp(),
    })
  await logAudit({ actor, action: "Block", targetId: discordId })
}

export async function unblockUser(
  discordId: string,
  actor: { discordId: string; username: string },
): Promise<void> {
  if (!isOwner(actor.discordId)) throw new Error("Only the Owner may unblock users.")
  await getAdminDb().collection(BLOCKED_USERS_COLLECTION).doc(discordId).delete()
  await logAudit({ actor, action: "Unblock", targetId: discordId })
}

/* -------------------------------------------------------------------------- */
/*  Dynamic authorization (managers approved after launch)                    */
/* -------------------------------------------------------------------------- */

export async function isDynamicallyAuthorized(discordId: string): Promise<boolean> {
  try {
    const doc = await getAdminDb()
      .collection(AUTHORIZED_MANAGERS_COLLECTION)
      .doc(discordId)
      .get()
    return doc.exists
  } catch (error) {
    console.error("[v0] Authorized-managers lookup failed:", error)
    return false
  }
}

export async function addAuthorizedManager(
  discordId: string,
  meta: { username?: string | null },
  actor: { discordId: string; username: string },
): Promise<void> {
  await getAdminDb()
    .collection(AUTHORIZED_MANAGERS_COLLECTION)
    .doc(discordId)
    .set({
      discordId,
      username: meta.username ?? null,
      approvedBy: actor.username,
      approvedById: actor.discordId,
      createdAt: FieldValue.serverTimestamp(),
    })
}

/* -------------------------------------------------------------------------- */
/*  Security logs (every unauthorized / blocked attempt)                      */
/* -------------------------------------------------------------------------- */

export type SecurityLogInput = {
  discordId: string
  username: string
  reason: "unauthorized" | "blocked"
  meta: RequestMeta
}

export async function logSecurityEvent(input: SecurityLogInput): Promise<void> {
  try {
    await getAdminDb().collection(SECURITY_LOGS_COLLECTION).add({
      discordId: input.discordId,
      username: input.username,
      reason: input.reason,
      ipHash: input.meta.ipHash,
      userAgent: input.meta.userAgent,
      country: input.meta.country,
      route: input.meta.route,
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (error) {
    console.error("[v0] Failed to write security log:", error)
  }
}

/* -------------------------------------------------------------------------- */
/*  Audit logs (every manager action)                                         */
/* -------------------------------------------------------------------------- */

export async function logAudit(input: {
  actor: { discordId: string; username: string }
  action: AuditAction
  targetId: string
}): Promise<void> {
  try {
    await getAdminDb().collection(AUDIT_LOGS_COLLECTION).add({
      managerId: input.actor.discordId,
      managerName: input.actor.username,
      action: input.action,
      applicantId: input.targetId,
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (error) {
    console.error("[v0] Failed to write audit log:", error)
  }
}
