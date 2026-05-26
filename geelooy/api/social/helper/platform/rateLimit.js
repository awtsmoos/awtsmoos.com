//B"H
const { put, get } = require('./platformStore.js');
function checkRateLimit({ $i, subject, bucket = 'default', limit = 60, windowMs = 60000, cost = 1 }) {
  const now = Date.now();
  const parts = ['rateLimit', bucket, subject];
  const old = get({ $i, shard: 'audit', parts })?.value;
  const resetAt = old && old.resetAt > now ? old.resetAt : now + Number(windowMs);
  const used = old && old.resetAt > now ? Number(old.used || 0) + Number(cost) : Number(cost);
  const record = { subject, bucket, limit: Number(limit), used, remaining: Math.max(0, Number(limit) - used), resetAt, allowed: used <= Number(limit), updatedAt: now };
  put({ $i, shard: 'audit', parts, value: record, meta: { kind: 'rateLimit', bucket } });
  return record;
}
module.exports = { checkRateLimit };
