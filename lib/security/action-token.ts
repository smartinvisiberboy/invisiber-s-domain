import "server-only"
import { createHmac, timingSafeEqual } from "crypto"

/**
 * Capability tokens embedded in the owner approval email. Each link carries a
 * signed, expiring token. Possession of a valid token (delivered only to the
 * owner's inbox) authorizes exactly one action on one access request.
 */

export type ActionKind = "approve" | "reject"

export type ActionPayload = {
  requestId: string
  discordId: string
  action: ActionKind
  exp: number
}

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not set.")
  return secret
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url")
}

export function createActionToken(
  data: Omit<ActionPayload, "exp">,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + ttlMs })).toString(
    "base64url",
  )
  return `${payload}.${sign(payload)}`
}

export function verifyActionToken(token: string | undefined | null): ActionPayload | null {
  if (!token || !token.includes(".")) return null
  const [payload, signature] = token.split(".")
  const expected = sign(payload)

  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as ActionPayload
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null
    if (data.action !== "approve" && data.action !== "reject") return null
    return data
  } catch {
    return null
  }
}
