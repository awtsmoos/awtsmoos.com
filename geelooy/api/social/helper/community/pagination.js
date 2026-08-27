//B"H
/**
 * The Awtsmoos measures the flood before it reaches the vessel. A queue may
 * contain thousands of sparks, yet each request receives only a safe handful.
 */
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
function whole(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.floor(number);
}
function clampLimit(value, fallback = DEFAULT_LIMIT, max = MAX_LIMIT) {
  const number = whole(value, fallback);
  if (number < 1) return fallback;
  return Math.min(number, max);
}
function clampOffset(value) {
  return Math.max(0, whole(value, 0));
}
function clampPagination({ limit, offset, defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT } = {}) {
  return { limit: clampLimit(limit, defaultLimit, maxLimit), offset: clampOffset(offset) };
}
module.exports = { DEFAULT_LIMIT, MAX_LIMIT, clampLimit, clampOffset, clampPagination };
