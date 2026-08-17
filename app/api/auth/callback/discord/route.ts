import { handleDiscordCallback } from "@/lib/auth/discord-callback"

export const dynamic = "force-dynamic"

// Canonical Discord OAuth callback path:
// https://<domain>/api/auth/callback/discord
export async function GET(request: Request) {
  return handleDiscordCallback(request)
}
