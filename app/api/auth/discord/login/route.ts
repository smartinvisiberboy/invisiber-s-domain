import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { DISCORD_OAUTH_SCOPES, OAUTH_STATE_COOKIE } from "@/lib/auth/config"
import { getRedirectUri } from "@/lib/auth/discord-callback"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const clientId = process.env.DISCORD_CLIENT_ID

  if (!clientId) {
    return NextResponse.redirect(`${origin}/manager?error=not_configured`)
  }

  const state = randomBytes(16).toString("hex")
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(origin),
    response_type: "code",
    scope: DISCORD_OAUTH_SCOPES.join(" "),
    state,
    prompt: "consent",
  })

  const response = NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`)
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })
  return response
}
