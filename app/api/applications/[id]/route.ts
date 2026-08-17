import { NextResponse } from "next/server"
import { getManagerSession } from "@/lib/auth/session"
import { APPLICATIONS_COLLECTION, getAdminDb } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import { logAudit } from "@/lib/security/store"

export const dynamic = "force-dynamic"

const VALID_STATUSES = new Set(["accepted", "rejected", "pending"])

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json().catch(() => null)) as { status?: string } | null
  const status = body?.status

  if (!status || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  try {
    const db = getAdminDb()
    await db
      .collection(APPLICATIONS_COLLECTION)
      .doc(id)
      .update({
        status,
        reviewedBy: session.username,
        reviewedAt: FieldValue.serverTimestamp(),
      })

    // Record the manager decision in the audit trail (accepted/rejected only).
    if (status === "accepted" || status === "rejected") {
      await logAudit({
        actor: { discordId: session.discordId, username: session.username },
        action: status === "accepted" ? "Accept" : "Reject",
        targetId: id,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Failed to update application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
