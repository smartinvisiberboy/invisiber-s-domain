const MESSAGES: Record<string, string> = {
  unauthorized:
    "That Discord account is not authorized yet. Your access request has been submitted for approval — you'll be notified once reviewed.",
  not_configured: "Discord OAuth is not configured yet. Add the Discord environment variables.",
  state_mismatch: "Login session expired or was tampered with. Please try again.",
  token_exchange: "Could not verify your Discord login. Please try again.",
  identity: "Could not read your Discord identity. Please try again.",
  denied: "Discord authorization was cancelled.",
}

export function ManagerLoginError({ error }: { error?: string }) {
  if (!error) return null
  const message = MESSAGES[error] ?? "Something went wrong during login. Please try again."
  return (
    <div
      role="alert"
      className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  )
}
