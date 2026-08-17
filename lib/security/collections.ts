/** Firestore collection names used by the Manager Portal security system. */
export const ACCESS_REQUESTS_COLLECTION = "access_requests"
export const BLOCKED_USERS_COLLECTION = "blocked_users"
export const SECURITY_LOGS_COLLECTION = "security_logs"
export const AUDIT_LOGS_COLLECTION = "audit_logs"
/** Dynamically approved managers (in addition to the static base list in auth/config). */
export const AUTHORIZED_MANAGERS_COLLECTION = "authorized_managers"

export type AccessRequestStatus = "pending" | "approved" | "rejected"

/** Actions recorded in the audit log. */
export type AuditAction = "Accept" | "Reject" | "Block" | "Unblock" | "Approve Manager"
