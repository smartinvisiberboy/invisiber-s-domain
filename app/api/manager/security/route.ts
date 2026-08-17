import { NextResponse } from "next/server"
import { getManagerSession } from "@/lib/auth/session"
import { isOwner } from "@/lib/auth/config"
import { addAuthorizedManager, blockUser, logAudit, unblockUser } from "@/lib/security/store"

export const dynamic = "force-dynamic"

type Body = {
  action?: "block" | "unblock" | "approveManager"
  discordId?: string
  username?: string | null
  reason?: string
}

/**
 * Owner-only privileged operations: block / unblock a Discord ID and manually
 * approve a manager. Every action is gated by a valid Owner session and written
 * to the audit log inside the store helpers.
 */
export async function POST(request: Request) {
  const session = await getManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isOwner(session.discordId)) {
    return NextResponse.json({ error: "Only the Owner may perform this action." }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as Body | null
  const action = body?.action
  const discordId = body?.discordId?.trim()

  if (!action || !discordId) {
    return NextResponse.json({ error: "action and discordId are required." }, { status: 400 })
  }

  const actor = { discordId: session.discordId, username: session.username }

  try {
    switch (action) {
      case "block":
        await blockUser(discordId, actor, body?.reason)
        break
      case "unblock":
        await unblockUser(discordId, actor)
        break
      case "approveManager":
        await addAuthorizedManager(discordId, { username: body?.username ?? null }, actor)
        await logAudit({ actor, action: "Approve Manager", targetId: discordId })
        break
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed."
    console.error("[v0] Security action failed:", error)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
