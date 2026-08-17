import { NextResponse } from "next/server"
import { isAuthorizedManager, managerRole, OAUTH_STATE_COOKIE, SESSION_COOKIE } from "@/lib/auth/config"
import { createSessionToken, SESSION_MAX_AGE } from "@/lib/auth/session"
import { recordAccessRequest } from "@/lib/access-requests"

export const dynamic = "force-dynamic"

function getRedirectUri(origin: string): string {
  return process.env.DISCORD_REDIRECT_URI || `${origin}/api/auth/discord/callback`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.split("=")[1]

  if (!code) {
    return NextResponse.redirect(`${origin}/manager?error=denied`)
  }
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}/manager?error=state_mismatch`)
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/manager?error=not_configured`)
  }

  // Exchange the authorization code for an access token.
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(origin),
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/manager?error=token_exchange`)
  }

  const tokenData = (await tokenRes.json()) as { access_token: string; token_type: string }

  // Fetch the Discord user identity.
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${origin}/manager?error=identity`)
  }

  const user = (await userRes.json()) as {
    id: string
    username: string
    global_name?: string
    avatar?: string | null
  }

  if (!isAuthorizedManager(user.id)) {
    // Log the attempt as a pending access request and email the owner for approval.
    await recordAccessRequest({
      discordId: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null,
    })
    return NextResponse.redirect(`${origin}/manager?error=unauthorized`)
  }

  const token = createSessionToken({
    discordId: user.id,
    username: user.global_name || user.username,
    role: managerRole(user.id),
    avatar: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : null,
  })

  const response = NextResponse.redirect(`${origin}/manager/dashboard`)
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  // Clear the one-time state cookie.
  response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 })
  return response
}
