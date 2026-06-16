// B"H
const { putBlob } = require("./blobStore.js");
const { putEphemeral } = require("./ephemeralStore.js");

const DEFAULT_MAX_INLINE_BYTES = 12000;

function jsonBytes(value) {
  try { return Buffer.byteLength(JSON.stringify(value), "utf8"); }
  catch (_) { return 0; }
}

function normalizeMode(value) {
  const mode = String(value || "inline").toLowerCase();
  return ["inline", "url", "auto", "ephemeral", "ref"].includes(mode) ? mode : "inline";
}

function shouldExternalize(payload, bytes) {
  const mode = normalizeMode(payload.responseMode);
  if (["url", "ephemeral", "ref"].includes(mode)) return true;
  if (mode !== "auto") return false;
  const maxInlineBytes = Number(payload.maxInlineBytes || DEFAULT_MAX_INLINE_BYTES);
  return bytes > Math.max(1000, maxInlineBytes || DEFAULT_MAX_INLINE_BYTES);
}

function wantsHumanUrl(payload = {}) {
  const mode = normalizeMode(payload.responseMode);
  return mode === "url" || payload.humanPreview === true || payload.humanPreview === "true";
}

/**
 * B"H
 * Large tunnel responses should not drown chat.
 *
 * - responseMode=url: human-friendly short blob URL.
 * - responseMode=ephemeral/ref or auto: AI-facing awtsmoos://turn-result ref.
 * - inline: unchanged.
 */
function maybeExternalize(result, payload = {}) {
  const bytes = jsonBytes(result);
  if (!shouldExternalize(payload, bytes)) return result;

  if (!wantsHumanUrl(payload)) return ephemeralResponse(result, payload, bytes);
  return blobResponse(result, payload, bytes);
}

function ephemeralResponse(result, payload, bytes) {
  const stored = putEphemeral({
    body: JSON.stringify(result, null, 2),
    mimeType: "application/json; charset=utf-8",
    ttlSeconds: payload.ttlSeconds,
    meta: { action: payload.action, path: payload.path || payload.p || "", tunnelName: payload.tunnelName || "", turnScoped: true },
    kind: "turn-result"
  });
  return {
    BH: "B\"H",
    ok: result && result.ok !== false,
    action: payload.action,
    responseMode: "ephemeral",
    externalized: true,
    resultRef: stored.resultRef,
    ephemeral: stored,
    expiresAt: stored.expiresAt,
    expiresInSeconds: stored.expiresInSeconds,
    bytes: stored.bytes,
    sha256: stored.sha256,
    originalBytes: bytes,
    summary: summarizeResult(result),
    aiInstructions: "Large result stored in ephemeral Awtsmoos transport. Use ephemeralPage, ephemeralSearch, or ephemeralDelete with the resultRef/id. This ref auto-expires and is not a human public URL.",
    inline: { preview: "Large response stored as ephemeral resultRef.", keys: result && typeof result === "object" ? Object.keys(result).slice(0, 40) : [] }
  };
}

function blobResponse(result, payload, bytes) {
  const stored = putBlob({ body: JSON.stringify(result, null, 2), mimeType: "application/json; charset=utf-8", ttlSeconds: payload.ttlSeconds, meta: { action: payload.action, path: payload.path || payload.p || "" } });
  const base = String(payload.controlBaseUrl || "").replace(/\/fs\/[^/]+$/, "");
  const contentUrl = `${base}/blob/${stored.id}`;
  const viewUrl = `${contentUrl}/view`;
  const handoffUrl = payload.tunnelName ? `${base}/handoff/${encodeURIComponent(payload.tunnelName)}` : "";
  return { BH: "B\"H", ok: result && result.ok !== false, action: payload.action, responseMode: "url", externalized: true, contentUrl, viewUrl, handoffUrl, expiresAt: stored.expiresAt, bytes: stored.bytes, sha256: stored.sha256, originalBytes: bytes, inline: { preview: "Response stored in a short-lived URL because responseMode requested it.", keys: result && typeof result === "object" ? Object.keys(result).slice(0, 40) : [] } };
}

function summarizeResult(result) {
  if (!result || typeof result !== "object") return "Large scalar result externalized.";
  const parts = [];
  for (const key of ["returnedCount", "returnedResults", "returnedRows", "count", "totalResults", "bytes", "path", "action"]) if (result[key] !== undefined) parts.push(`${key}=${result[key]}`);
  return parts.length ? parts.join(", ") : `Large ${Object.keys(result).length}-key result externalized.`;
}

module.exports = { maybeExternalize, normalizeMode, jsonBytes };
