// B"H
const crypto = require("crypto");

const DEFAULT_TTL_SECONDS = 30 * 60;
const MAX_TTL_SECONDS = 3 * 60 * 60;
const DEFAULT_PAGE_BYTES = 256 * 1024;
const MAX_PAGE_BYTES = 2 * 1024 * 1024;
const store = new Map();

function now() { return Date.now(); }
function makeId(prefix = "res") { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(10).toString("hex")}`; }
function safeTtl(ttlSeconds) {
  const n = Number(ttlSeconds || DEFAULT_TTL_SECONDS);
  if (!Number.isFinite(n)) return DEFAULT_TTL_SECONDS;
  return Math.max(30, Math.min(Math.floor(n), MAX_TTL_SECONDS));
}
function cleanExpired() {
  const at = now();
  for (const [id, item] of store.entries()) if (!item || item.expiresAt <= at) store.delete(id);
}
function toBuffer(body) {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body, "utf8");
  return Buffer.from(JSON.stringify(body ?? null, null, 2), "utf8");
}

/**
 * B"H
 * Chapter: The great result became a temporary river-handle.
 *
 * This is not a human preview URL. It is an AI transport vessel: short-lived,
 * pageable, searchable, deletable, and shaped so chat can say "read page 4" not
 * paste a million lines. Nothing here should live forever.
 */
function putEphemeral({ body, mimeType = "application/json; charset=utf-8", ttlSeconds, meta = {}, kind = "result" }) {
  cleanExpired();
  const id = makeId("res");
  const buffer = toBuffer(body);
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const expiresAt = now() + safeTtl(ttlSeconds) * 1000;
  const text = isTextMime(mimeType) ? buffer.toString("utf8") : null;
  const item = { id, kind, buffer, text, mimeType, bytes: buffer.length, sha256, meta, createdAt: now(), expiresAt };
  store.set(id, item);
  return descriptor(item);
}

function descriptor(item) {
  return {
    id: item.id,
    resultRef: `awtsmoos://turn-result/${item.id}`,
    apiUrl: `/api/tunnel/control/ephemeral/${item.id}`,
    pageUrl: `/api/tunnel/control/ephemeral/${item.id}/page`,
    searchUrl: `/api/tunnel/control/ephemeral/${item.id}/search`,
    deleteUrl: `/api/tunnel/control/ephemeral/${item.id}/delete`,
    expiresAt: item.expiresAt,
    expiresInSeconds: Math.max(0, Math.floor((item.expiresAt - now()) / 1000)),
    bytes: item.bytes,
    sha256: item.sha256,
    mimeType: item.mimeType,
    kind: item.kind,
    meta: item.meta
  };
}

function getEphemeral(id) {
  cleanExpired();
  const item = store.get(String(id || ""));
  if (!item) return null;
  if (item.expiresAt <= now()) { store.delete(item.id); return null; }
  return item;
}

function getDescriptor(id) {
  const item = getEphemeral(id);
  return item ? descriptor(item) : null;
}

function pageEphemeral(id, opts = {}) {
  const item = getEphemeral(id);
  if (!item) return null;
  const offset = Math.max(0, Math.floor(Number(opts.offsetBytes || opts.offset || 0)));
  const size = Math.max(1, Math.min(Math.floor(Number(opts.maxBytes || opts.pageBytes || DEFAULT_PAGE_BYTES)), MAX_PAGE_BYTES));
  const slice = item.buffer.subarray(offset, Math.min(item.buffer.length, offset + size));
  const nextOffsetBytes = offset + slice.length < item.buffer.length ? offset + slice.length : null;
  return { ok: true, ...descriptor(item), offsetBytes: offset, returnedBytes: slice.length, nextOffsetBytes, hasNextPage: nextOffsetBytes !== null, content: item.text !== null ? slice.toString("utf8") : slice.toString("base64"), encoding: item.text !== null ? "utf8" : "base64" };
}

function searchEphemeral(id, query = "", opts = {}) {
  const item = getEphemeral(id);
  if (!item) return null;
  const text = item.text ?? item.buffer.toString("utf8");
  const q = String(query || "");
  if (!q) return { ok: false, error: "missing_query", ...descriptor(item) };
  const limit = Math.max(1, Math.min(Number(opts.limit || 50), 1000));
  const caseSensitive = opts.caseSensitive === true || opts.caseSensitive === "true";
  const haystack = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? q : q.toLowerCase();
  const results = [];
  let at = Math.max(0, Number(opts.cursor || 0));
  while (results.length < limit) {
    const found = haystack.indexOf(needle, at);
    if (found < 0) break;
    const start = Math.max(0, found - 160);
    const end = Math.min(text.length, found + q.length + 160);
    results.push({ offsetChars: found, preview: text.slice(start, end) });
    at = found + Math.max(1, q.length);
  }
  return { ok: true, ...descriptor(item), query: q, returnedResults: results.length, nextCursor: results.length ? at : null, results };
}

function deleteEphemeral(id) {
  cleanExpired();
  const existed = store.delete(String(id || ""));
  return { ok: true, deleted: existed, id };
}

function listEphemeral() {
  cleanExpired();
  return [...store.values()].map(descriptor).sort((a, b) => b.expiresAt - a.expiresAt);
}

function isTextMime(mimeType) {
  return /^text\//.test(mimeType) || /json|javascript|xml|yaml|markdown|csv/.test(mimeType);
}

module.exports = { DEFAULT_TTL_SECONDS, MAX_TTL_SECONDS, putEphemeral, getEphemeral, getDescriptor, pageEphemeral, searchEphemeral, deleteEphemeral, listEphemeral, cleanExpired };
