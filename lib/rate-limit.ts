import "server-only"

/**
 * Lightweight in-memory rate limiter.
 *
 * NOTE: This is per-server-instance and non-distributed. It resets on cold
 * starts and does not coordinate across multiple serverless instances. It is a
 * reasonable spam safeguard for a low-traffic public endpoint, but for strong
 * guarantees swap this for a shared store (e.g. Upstash Redis).
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Occasionally sweep expired buckets so the map does not grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * @param key    Unique identifier for the caller (e.g. IP address).
 * @param limit  Max requests allowed within the window.
 * @param windowMs  Window duration in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}

/** Best-effort client IP extraction from proxy headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}
