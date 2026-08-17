import "server-only"

/**
 * Minimal Resend client using the REST API directly — no extra dependency.
 * All credentials come from environment variables; nothing is hardcoded.
 *
 * Required env vars:
 * - RESEND_API_KEY   Your Resend API key (secret).
 * - RESEND_FROM_EMAIL A verified Resend sender, e.g. "Invisiber <noreply@yourdomain.com>".
 *
 * Optional:
 * - ACCESS_REQUEST_NOTIFY_EMAIL  Overrides the default approval recipient.
 */

/** Default recipient for manager access-request approvals. */
export const DEFAULT_APPROVAL_RECIPIENT = "smartyoo2009@gmail.com"

export function getApprovalRecipient(): string {
  return process.env.ACCESS_REQUEST_NOTIFY_EMAIL || DEFAULT_APPROVAL_RECIPIENT
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
}

type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Sends an email through Resend. Returns the Resend message id on success.
 * Throws when Resend is not configured or the API responds with an error.
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailParams): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    throw new Error(
      "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    )
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Resend request failed (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as { id: string }
  return data
}
