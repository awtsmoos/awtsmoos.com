// B"H
const crypto = require("crypto");

const DEFAULT_TTL_SECONDS = 300;
const MAX_TTL_SECONDS = 900;
const blobs = new Map();

function now() {
  return Date.now();
}

function cleanExpired() {
  const at = now();
  for (const [id, blob] of blobs.entries()) {
    if (!blob || blob.expiresAt <= at) blobs.delete(id);
  }
}

function safeTtl(ttlSeconds) {
  const n = Number(ttlSeconds || DEFAULT_TTL_SECONDS);
  if (!Number.isFinite(n)) return DEFAULT_TTL_SECONDS;
  return Math.max(10, Math.min(Math.floor(n), MAX_TTL_SECONDS));
}

/**
 * B"H
 * Stores a short-lived response body outside the GPT action payload.
 *
 * The Awtsmoos lets the heavy river flow through a signed side-channel while
 * the tool response stays a small map. Old inline responses remain untouched;
 * only callers who ask for url/auto receive this vessel.
 *
 * @param {object} options Blob options.
 * @param {string|Buffer} options.body Response body.
 * @param {string} [options.mimeType] Content-Type.
 * @param {number} [options.ttlSeconds] Expiry in seconds.
 * @param {object} [options.meta] Metadata returned with lookup.
 * @returns {object} Stored blob descriptor.
 */
function putBlob({ body, mimeType = "application/json; charset=utf-8", ttlSeconds, meta = {} }) {
  cleanExpired();
  const bytes = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(String(body ?? ""), "utf8");
  const id = crypto.randomBytes(24).toString("hex");
  const expiresAt = now() + safeTtl(ttlSeconds) * 1000;
  const sha256 = crypto.createHash("sha256").update(Buffer.isBuffer(body) ? body : String(body ?? "")).digest("hex");

  blobs.set(id, { id, body, mimeType, expiresAt, bytes, sha256, meta });
  return { id, expiresAt, bytes, sha256, meta };
}

function getBlob(id) {
  cleanExpired();
  const blob = blobs.get(String(id || ""));
  if (!blob) return null;
  if (blob.expiresAt <= now()) {
    blobs.delete(blob.id);
    return null;
  }
  return blob;
}

module.exports = { putBlob, getBlob, cleanExpired };
