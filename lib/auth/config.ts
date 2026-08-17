/** The single Owner Discord ID. Only the Owner may approve, reject, block, or unblock. */
export const OWNER_ID = "1298322269264806020"

/** Discord IDs statically allowed to access the Manager Portal (base list). */
export const AUTHORIZED_MANAGERS: Record<string, string> = {
  "1298322269264806020": "Owner",
  "1340580833324695613": "Manager 1",
}

export function isOwner(discordId: string | undefined | null): boolean {
  return discordId === OWNER_ID
}

export function isAuthorizedManager(discordId: string | undefined | null): boolean {
  if (!discordId) return false
  return Object.prototype.hasOwnProperty.call(AUTHORIZED_MANAGERS, discordId)
}

export function managerRole(discordId: string): string {
  if (isOwner(discordId)) return "Owner"
  return AUTHORIZED_MANAGERS[discordId] ?? "Manager"
}

export const SESSION_COOKIE = "invisiber_manager_session"
export const OAUTH_STATE_COOKIE = "invisiber_oauth_state"

export const DISCORD_OAUTH_SCOPES = ["identify", "email"] as const
