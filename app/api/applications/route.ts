import { NextResponse } from "next/server"
import { getManagerSession } from "@/lib/auth/session"
import { APPLICATIONS_COLLECTION, getAdminDb } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import type { ApplicationDoc, ApplicationPayload } from "@/lib/application"
import { ACCOUNT_TYPES, ELEMENTS } from "@/lib/application"
import { GUILDS } from "@/lib/guilds"

export const dynamic = "force-dynamic"

// ── Managers list every application ──────────────────────────────────────────
export async function GET() {
  const session = await getManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getAdminDb()
    const snapshot = await db.collection(APPLICATIONS_COLLECTION).orderBy("createdAt", "desc").get()

    const applications: ApplicationDoc[] = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...(data as Omit<ApplicationDoc, "id" | "createdAt" | "updatedAt">),
        id: doc.id,
        createdAt: typeof data.createdAt?.toMillis === "function" ? data.createdAt.toMillis() : (data.createdAt ?? 0),
        updatedAt: typeof data.updatedAt?.toMillis === "function" ? data.updatedAt.toMillis() : (data.updatedAt ?? 0),
      }
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("[v0] Failed to load applications:", error)
    return NextResponse.json({ error: "Failed to load applications. Is Firebase configured?" }, { status: 500 })
  }
}

// ── Applicants submit (no auth) ──────────────────────────────────────────────
function isStoredImage(v: unknown): v is { url: string; path: string } {
  return !!v && typeof v === "object" && typeof (v as { url?: unknown }).url === "string"
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as ApplicationPayload | null

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Server-side validation — never trust the client.
  const guild = GUILDS.find((g) => g.id === payload.guildId)
  if (!guild) {
    return NextResponse.json({ error: "Unknown guild" }, { status: 400 })
  }
  if (!payload.discordId?.trim()) {
    return NextResponse.json({ error: "Discord ID is required" }, { status: 400 })
  }
  const score = Number(payload.guildBossScore)
  if (!Number.isFinite(score) || score < 0) {
    return NextResponse.json({ error: "Invalid Guild Boss Score" }, { status: 400 })
  }
  if (!ACCOUNT_TYPES.includes(payload.accountType)) {
    return NextResponse.json({ error: "Invalid account type" }, { status: 400 })
  }
  // Enforce eligibility on the server.
  if (score < guild.minScore) {
    return NextResponse.json({ error: "Does not meet guild requirements" }, { status: 400 })
  }
  for (const el of ELEMENTS) {
    if (!Array.isArray(payload.hunters?.[el.id]) || payload.hunters[el.id].filter(isStoredImage).length < 2) {
      return NextResponse.json({ error: `Missing ${el.label} hunter images` }, { status: 400 })
    }
    if (!Array.isArray(payload.weapons?.[el.id]) || payload.weapons[el.id].filter(isStoredImage).length < 2) {
      return NextResponse.json({ error: `Missing ${el.label} weapon images` }, { status: 400 })
    }
  }
  if (![payload.profileImage, payload.guildBossScreenshot, payload.battleTierScreenshot].every(isStoredImage)) {
    return NextResponse.json({ error: "Missing required screenshots" }, { status: 400 })
  }

  try {
    const db = getAdminDb()
    const ref = await db.collection(APPLICATIONS_COLLECTION).add({
      discordId: payload.discordId.trim(),
      guildId: payload.guildId,
      guildName: guild.name,
      guildBossScore: score,
      accountType: payload.accountType,
      profileImage: payload.profileImage,
      guildBossScreenshot: payload.guildBossScreenshot,
      battleTierScreenshot: payload.battleTierScreenshot,
      hunters: payload.hunters,
      weapons: payload.weapons,
      successor: Array.isArray(payload.successor) ? payload.successor.filter(isStoredImage) : [],
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ id: ref.id })
  } catch (error) {
    console.error("[v0] Failed to save application:", error)
    return NextResponse.json({ error: "Failed to save application. Is Firebase configured?" }, { status: 500 })
  }
}
