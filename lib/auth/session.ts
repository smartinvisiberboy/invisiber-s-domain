import "server-only"
import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"
import { SESSION_COOKIE } from "./config"

/**
 * Lightweight stateless session: a JSON payload signed with an HMAC using
 * AUTH_SECRET. Avoids extra dependencies while remaining tamper-proof.
 */

export type ManagerSession = {
  discordId: string
  username: string
  role: string
  avatar?: string | null
  iat: number
}

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Generate one with: openssl rand -base64 32")
  }
  return secret
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url")
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url")
}

export function createSessionToken(data: Omit<ManagerSession, "iat">): string {
  const payload = base64url(JSON.stringify({ ...data, iat: Date.now() }))
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function verifySessionToken(token: string | undefined | null): ManagerSession | null {
  if (!token || !token.includes(".")) return null
  const [payload, signature] = token.split(".")
  const expected = sign(payload)

  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as ManagerSession
    if (Date.now() - data.iat > MAX_AGE_SECONDS * 1000) return null
    return data
  } catch {
    return null
  }
}

export async function getManagerSession(): Promise<ManagerSession | null> {
  const store = await cookies()
  return verifySessionToken(store.get(SESSION_COOKIE)?.value)
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS
