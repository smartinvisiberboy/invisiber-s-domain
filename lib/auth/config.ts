/** Discord IDs allowed to access the Manager Portal. */
export const AUTHORIZED_MANAGERS: Record<string, string> = {
  "1298322269264806020": "Owner",
  "1340580833324695613": "Manager",
}

export function isAuthorizedManager(discordId: string | undefined | null): boolean {
  if (!discordId) return false
  return Object.prototype.hasOwnProperty.call(AUTHORIZED_MANAGERS, discordId)
}

export function managerRole(discordId: string): string {
  return AUTHORIZED_MANAGERS[discordId] ?? "Manager"
}

export const SESSION_COOKIE = "invisiber_manager_session"
export const OAUTH_STATE_COOKIE = "invisiber_oauth_state"

export const DISCORD_OAUTH_SCOPES = ["identify"] as const
