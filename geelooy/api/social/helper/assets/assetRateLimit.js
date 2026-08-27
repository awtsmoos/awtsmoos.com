// B"H
/**
 * @module AssetRateLimit
 * @description
 * Chapter 117: The upload river flows, but not as a flood. Alias/IP buckets
 * reset every minute and protect the binary gate.
 */

const buckets = new Map();

function keyFor({ aliasId, ip }) {
  return `${aliasId || 'unknown'}::${ip || 'local'}`;
}

function requestIp($i) {
  return $i?.request?.headers?.['x-forwarded-for'] || $i?.request?.socket?.remoteAddress || $i?.request?.ip || 'local';
}

function checkRateLimit({ $i, aliasId, limit = 18 }) {
  const now = Date.now();
  const key = keyFor({ aliasId, ip: requestIp($i) });
  const bucket = buckets.get(key) || { count: 0, resetAt: now + 60_000 };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + 60_000;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > limit) return { error: true, code: 'UPLOAD_RATE_LIMIT', message: 'Too many uploads. Try again soon.', resetAt: bucket.resetAt };
  return { success: true, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
}

module.exports = { checkRateLimit, requestIp };
