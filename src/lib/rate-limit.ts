/**
 * Minimal in-memory token-bucket rate limiter.
 *
 * Good enough for a single-instance deployment and for local/dev. For a
 * horizontally-scaled production deployment swap the `buckets` map for a shared
 * store such as Upstash Redis (`@upstash/ratelimit`) — the call sites do not
 * need to change.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/**
 * @param key      unique identifier (e.g. `results:<ip>` or `results:<userId>`)
 * @param limit    max requests per window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const refillRate = limit / windowMs; // tokens per ms
  const existing = buckets.get(key);

  if (!existing) {
    buckets.set(key, { tokens: limit - 1, updatedAt: now });
    return { success: true, remaining: limit - 1, limit, resetMs: windowMs };
  }

  // refill based on elapsed time
  const elapsed = now - existing.updatedAt;
  existing.tokens = Math.min(limit, existing.tokens + elapsed * refillRate);
  existing.updatedAt = now;

  if (existing.tokens < 1) {
    const resetMs = Math.ceil((1 - existing.tokens) / refillRate);
    return { success: false, remaining: 0, limit, resetMs };
  }

  existing.tokens -= 1;
  return {
    success: true,
    remaining: Math.floor(existing.tokens),
    limit,
    resetMs: windowMs,
  };
}

/** Periodically drop idle buckets to bound memory. */
if (typeof setInterval !== "undefined") {
  const CLEANUP_INTERVAL = 10 * 60 * 1000;
  const timer = setInterval(() => {
    const cutoff = Date.now() - CLEANUP_INTERVAL;
    for (const [key, bucket] of buckets) {
      if (bucket.updatedAt < cutoff) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL);
  // don't keep the process alive just for cleanup
  if (typeof timer.unref === "function") timer.unref();
}

type HeaderBag = Headers | Record<string, string | string[] | undefined>;

function readHeader(headers: HeaderBag, name: string): string | null {
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(name);
  }
  const value = (headers as Record<string, string | string[] | undefined>)[name];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Extract a best-effort client IP from request headers. Works with both the Web
 * `Headers` object (route handlers) and the plain header object NextAuth passes
 * to `authorize`.
 *
 * NOTE: `x-forwarded-for` is client-controllable unless a trusted reverse proxy
 * overwrites it. Deploy this app behind a proxy that sets a trustworthy
 * forwarded-for / real-ip header, otherwise IP-based limits can be evaded.
 */
export function getClientIp(headers: HeaderBag): string {
  const forwarded = readHeader(headers, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return readHeader(headers, "x-real-ip") ?? "unknown";
}
