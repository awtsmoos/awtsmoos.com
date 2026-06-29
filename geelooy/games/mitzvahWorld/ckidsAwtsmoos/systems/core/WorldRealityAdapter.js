// B"H
/**
 * WorldRealityAdapter
 *
 * The Reality Layer is not gameplay and not rendering. It is a small set of
 * safe operations for the canonical world store: bounded lists, stable clocks,
 * JSON-safe snapshots, and path creation. Systems may dream, but they mutate
 * reality through this narrow vessel.
 */
export const DEFAULT_LIMITS = Object.freeze({ tiny:8, small:24, medium:40, large:80, history:120 });
export const now = () => Date.now();
export const cloneJson = value => JSON.parse(JSON.stringify(value ?? null));
export const clampNumber = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
export const capList = (list = [], limit = DEFAULT_LIMITS.medium) => (Array.isArray(list) ? list : []).slice(-limit);
export const uniqueList = (list = []) => [...new Set((Array.isArray(list) ? list : []).filter(Boolean))];
export function ensureObject(root, key, fallback = {}) {
  if (!root[key] || typeof root[key] !== 'object' || Array.isArray(root[key])) root[key] = { ...fallback };
  return root[key];
}
export function ensureArray(root, key) {
  if (!Array.isArray(root[key])) root[key] = [];
  return root[key];
}
export function appendBounded(root, key, row, limit = DEFAULT_LIMITS.medium) {
  const list = ensureArray(root, key);
  root[key] = capList([...list, row], limit);
  return row;
}
export function setPath(root, path, value) {
  const parts = String(path).split('.').filter(Boolean);
  let cursor = root;
  for (const part of parts.slice(0, -1)) cursor = ensureObject(cursor, part);
  cursor[parts.at(-1)] = value;
  return value;
}
export function getPath(root, path, fallback = undefined) {
  const parts = String(path).split('.').filter(Boolean);
  let cursor = root;
  for (const part of parts) { if (!cursor || typeof cursor !== 'object' || !(part in cursor)) return fallback; cursor = cursor[part]; }
  return cursor;
}
export function rememberBounded(root, bucket, key, row, limit = DEFAULT_LIMITS.medium) {
  const box = ensureObject(root, bucket);
  box[key] = capList([...(box[key] || []), row], limit);
  return row;
}
export default { DEFAULT_LIMITS, now, cloneJson, clampNumber, capList, uniqueList, ensureObject, ensureArray, appendBounded, setPath, getPath, rememberBounded };
