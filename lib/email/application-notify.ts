import "server-only"
import {
  getApplicationNotifyRecipient,
  isResendConfigured,
  sendEmail,
} from "@/lib/email/resend"

export type ApplicationNotifyInput = {
  applicationId: string
  discordId: string
  guildName: string
  guildBossScore: number
  accountType: string
  hunterCount: number
  weaponCount: number
  successorCount: number
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

function applicationEmailHtml(input: ApplicationNotifyInput, dashboardUrl: string): string {
  return `
  <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;background:#0d1017;color:#e6e9f0;border:1px solid #232a3a;border-radius:16px;overflow:hidden">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#141a2b,#0d1017);border-bottom:1px solid #232a3a">
      <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7aa6ff">Invisiber&apos;s Domain</p>
      <h1 style="margin:8px 0 0;font-size:22px;color:#fff">&#127881; New Guild Application</h1>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 16px;line-height:1.6;color:#aeb6c7">
        A new applicant just submitted a guild application. Review the full details and screenshots in the Manager Portal.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row("Discord ID", input.discordId, true)}
        ${row("Guild", input.guildName)}
        ${row("Guild Boss Score", String(input.guildBossScore))}
        ${row("Account Type", input.accountType)}
        ${row("Hunter Images", String(input.hunterCount))}
        ${row("Weapon Images", String(input.weaponCount))}
        ${row("Successor Images", String(input.successorCount))}
        ${row("Application ID", input.applicationId, true)}
      </table>
      <div style="margin:28px 0 8px">
        <a href="${dashboardUrl}" style="display:inline-block;text-align:center;padding:13px 22px;background:#7aa6ff;color:#0d1017;text-decoration:none;border-radius:10px;font-weight:700">Open Manager Portal</a>
      </div>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#7c8598">
        You&apos;re receiving this because you manage Invisiber&apos;s Domain applications.
      </p>
    </div>
  </div>`
}

/**
 * Emails the manager inbox when a new application is submitted.
 * Failures are swallowed (logged only) so they never block the applicant's
 * submission response.
 */
export async function notifyNewApplication(
  input: ApplicationNotifyInput,
  baseUrl: string,
): Promise<void> {
  if (!isResendConfigured()) {
    console.warn("[v0] Resend not configured — skipping new-application email.")
    return
  }

  try {
    const dashboardUrl = `${baseUrl}/manager/dashboard`
    await sendEmail({
      to: getApplicationNotifyRecipient(),
      subject: `🎉 New Application — ${input.guildName} (${input.discordId})`,
      html: applicationEmailHtml(input, dashboardUrl),
    })
  } catch (error) {
    console.error("[v0] Failed to send new-application email:", error)
  }
}
