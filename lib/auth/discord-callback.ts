import { NextResponse } from "next/server"
import { isAuthorizedManager, managerRole, OAUTH_STATE_COOKIE, SESSION_COOKIE } from "@/lib/auth/config"
import { createSessionToken, SESSION_MAX_AGE } from "@/lib/auth/session"
import { recordAccessRequest } from "@/lib/access-requests"
import { collectRequestMeta } from "@/lib/security/meta"
import { isBlocked, isDynamicallyAuthorized, logSecurityEvent } from "@/lib/security/store"

/**
 * Canonical OAuth redirect URI. When DISCORD_REDIRECT_URI is set it is used
 * verbatim (it must match what is registered in the Discord Developer Portal).
 * Otherwise we fall back to the primary callback path.
 */
export function getRedirectUri(origin: string): string {
  return process.env.DISCORD_REDIRECT_URI || `${origin}/api/auth/callback/discord`
}

/**
 * Shared Discord OAuth callback handler. Mounted at both
 * `/api/auth/callback/discord` and `/api/auth/discord/callback` so the flow
 * works regardless of which path DISCORD_REDIRECT_URI points to.
 */
export async function handleDiscordCallback(request: Request): Promise<NextResponse> {
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
    email?: string | null
  }

  const displayName = user.global_name || user.username
  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : null
  const meta = collectRequestMeta(request, "/manager")

  // 1. Blocklist takes precedence over everything: deny, log, and never create a session.
  if (await isBlocked(user.id)) {
    await logSecurityEvent({
      discordId: user.id,
      username: displayName,
      reason: "blocked",
      meta,
    })
    return NextResponse.redirect(`${origin}/manager?error=blocked`)
  }

  // 2. Deny-by-default: authorized only if on the static list or dynamically approved.
  const authorized = isAuthorizedManager(user.id) || (await isDynamicallyAuthorized(user.id))
  if (!authorized) {
    await logSecurityEvent({
      discordId: user.id,
      username: displayName,
      reason: "unauthorized",
      meta,
    })
    // Record a pending access request and email the owner with Approve / Reject links.
    await recordAccessRequest(
      {
        discordId: user.id,
        username: user.username,
        displayName,
        avatar,
        email: user.email ?? null,
        meta,
      },
      origin,
    )
    return NextResponse.redirect(`${origin}/manager?error=unauthorized`)
  }

  const token = createSessionToken({
    discordId: user.id,
    username: displayName,
    role: managerRole(user.id),
    avatar,
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
