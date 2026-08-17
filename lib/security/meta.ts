import "server-only"
import { createHash } from "crypto"

/**
 * Non-reversible, privacy-preserving metadata collected from an incoming request.
 * The raw IP address is never stored — only a salted SHA-256 hash.
 */
export type RequestMeta = {
  ipHash: string
  userAgent: string
  country: string
  route: string
}

function headerValue(request: Request, name: string): string | null {
  const value = request.headers.get(name)
  return value && value.trim().length > 0 ? value.trim() : null
}

/** Extracts the client IP from common proxy headers (Vercel sets x-forwarded-for). */
function getRawIp(request: Request): string {
  const forwarded = headerValue(request, "x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return headerValue(request, "x-real-ip") ?? "unknown"
}

/** Salted hash of the client IP so we never persist the raw address. */
function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET ?? "invisiber-salt"
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32)
}

export function collectRequestMeta(request: Request, route: string): RequestMeta {
  return {
    ipHash: hashIp(getRawIp(request)),
    userAgent: headerValue(request, "user-agent") ?? "unknown",
    // Vercel provides the visitor's country via this header.
    country: headerValue(request, "x-vercel-ip-country") ?? "unknown",
    route,
  }
}
