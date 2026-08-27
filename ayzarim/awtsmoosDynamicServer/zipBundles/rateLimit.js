// B"H
const { LIMITS } = require("./bundleLimits.js");

const buckets = new Map();

/**
 * B"H
 * A small in-memory guard for public ZIP requests. It is intentionally humble;
 * production can replace it with a shared store without changing callers.
 */
function checkRateLimit(key = "anon", bytes = 0, now = Date.now()) {
  const id = String(key || "anon");
  const old = buckets.get(id);
  const fresh = !old || now - old.startedAt > LIMITS.windowMs;
  const bucket = fresh ? { startedAt: now, requests: 0, bytes: 0 } : old;
  bucket.requests += 1;
  bucket.bytes += Number(bytes || 0);
  buckets.set(id, bucket);
  if (bucket.requests > LIMITS.maxRequestsPerWindow) return deny("too_many_zip_requests", bucket);
  if (bucket.bytes > LIMITS.maxBytesPerWindow) return deny("too_many_zip_bytes", bucket);
  return { ok: true, bucket };
}

function deny(error, bucket) {
  return { ok: false, statusCode: 429, error, bucket, retryAfterMs: LIMITS.windowMs };
}

module.exports = { checkRateLimit, buckets };
