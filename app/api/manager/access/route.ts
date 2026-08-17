import { NextResponse } from "next/server"
import { verifyActionToken } from "@/lib/security/action-token"
import { approveAccessRequest, rejectAccessRequest } from "@/lib/access-requests"

export const dynamic = "force-dynamic"

/**
 * Landing endpoint for the Approve / Reject buttons in the owner's email.
 * Authorization is the signed, expiring token itself — delivered only to the
 * owner's inbox. Default posture is denial: any invalid, tampered, or expired
 * token results in no approval.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")
  const payload = verifyActionToken(token)

  if (!payload) {
    return htmlResponse(
      "Link expired or invalid",
      "This approval link is no longer valid. Access remains denied by default.",
      false,
      410,
    )
  }

  try {
    if (payload.action === "approve") {
      await approveAccessRequest(payload.requestId, payload.discordId)
      return htmlResponse(
        "Access Approved",
        `Discord ID ${payload.discordId} has been granted Manager access and can now sign in.`,
        true,
      )
    }
    await rejectAccessRequest(payload.requestId, payload.discordId)
    return htmlResponse(
      "Access Rejected",
      `The request from Discord ID ${payload.discordId} has been rejected. Access remains denied.`,
      false,
    )
  } catch (error) {
    console.error("[v0] Access action failed:", error)
    return htmlResponse(
      "Something went wrong",
      "The action could not be completed. Access remains denied by default.",
      false,
      500,
    )
  }
}

function htmlResponse(title: string, message: string, positive: boolean, status = 200): NextResponse {
  const accent = positive ? "#16a34a" : "#dc2626"
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${title} — Invisiber's Domain</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1017;font-family:ui-sans-serif,system-ui,sans-serif;color:#e6e9f0">
  <div style="max-width:440px;margin:24px;padding:36px 32px;text-align:center;background:#141a2b;border:1px solid #232a3a;border-radius:18px">
    <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7aa6ff">Invisiber's Domain</p>
    <h1 style="margin:14px 0 0;font-size:24px;color:${accent}">${title}</h1>
    <p style="margin:14px 0 0;line-height:1.6;color:#aeb6c7">${message}</p>
  </div>
</body>
</html>`
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
