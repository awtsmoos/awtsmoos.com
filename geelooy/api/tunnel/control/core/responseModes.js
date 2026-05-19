// B"H
const { putBlob } = require("./blobStore.js");

const DEFAULT_MAX_INLINE_BYTES = 12000;

function jsonBytes(value) {
  try { return Buffer.byteLength(JSON.stringify(value), "utf8"); }
  catch (_) { return 0; }
}

function normalizeMode(value) {
  const mode = String(value || "inline").toLowerCase();
  return ["inline", "url", "auto"].includes(mode) ? mode : "inline";
}

function shouldUrl(payload, bytes) {
  const mode = normalizeMode(payload.responseMode);
  if (mode === "url") return true;
  if (mode !== "auto") return false;
  const maxInlineBytes = Number(payload.maxInlineBytes || DEFAULT_MAX_INLINE_BYTES);
  return bytes > Math.max(1000, maxInlineBytes || DEFAULT_MAX_INLINE_BYTES);
}

/**
 * B"H
 * Converts a large tunnel response into a short signed URL descriptor only
 * when the caller asks for responseMode=url/auto. Inline remains default.
 *
 * @param {object} result Tunnel result.
 * @param {object} payload Original tunnel payload.
 * @returns {object} Original or URL-wrapped result.
 */
function maybeExternalize(result, payload = {}) {
  const bytes = jsonBytes(result);
  if (!shouldUrl(payload, bytes)) return result;

  const stored = putBlob({
    body: JSON.stringify(result, null, 2),
    mimeType: "application/json; charset=utf-8",
    ttlSeconds: payload.ttlSeconds,
    meta: { action: payload.action, path: payload.path || payload.p || "" }
  });

  const base = String(payload.controlBaseUrl || "").replace(/\/fs\/[^/]+$/, "");
  const contentUrl = `${base}/blob/${stored.id}`;
  const viewUrl = `${contentUrl}/view`;
  const handoffUrl = payload.tunnelName ? `${base}/handoff/${encodeURIComponent(payload.tunnelName)}` : "";

  return {
    BH: "B\"H",
    ok: result && result.ok !== false,
    action: payload.action,
    responseMode: "url",
    contentUrl,
    viewUrl,
    handoffUrl,
    expiresAt: stored.expiresAt,
    bytes: stored.bytes,
    sha256: stored.sha256,
    originalBytes: bytes,
    inline: {
      preview: "Response stored in a short-lived URL because responseMode requested it.",
      keys: result && typeof result === "object" ? Object.keys(result).slice(0, 40) : []
    }
  };
}

module.exports = { maybeExternalize, normalizeMode };
