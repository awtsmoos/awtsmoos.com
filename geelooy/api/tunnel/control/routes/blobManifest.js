// B"H
const { getBlob } = require("../core/blobStore.js");

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    mimeType: "application/json; charset=utf-8",
    headers: { "Cache-Control": "private, no-store, max-age=0" },
    body: JSON.stringify(body, null, 2)
  };
}

/**
 * B"H
 * Structured traversal surface for one tunnel response blob.
 *
 * Humans may prefer /view.
 * Machines may prefer the raw blob.
 * Agents and future cognition crawlers can start here.
 */
async function blobManifest($i, vars = {}) {
  const got = getBlob(vars.blobId);
  if (!got) {
    return jsonResponse({ ok: false, error: "blob_not_found_or_expired" }, 404);
  }

  const root = `/api/tunnel/control/blob/${encodeURIComponent(vars.blobId)}`;

  return jsonResponse({
    ok: true,
    kind: "awtsmoos-tunnel-result",
    blobId: vars.blobId,
    rawUrl: root,
    viewUrl: `${root}/view`,
    manifestUrl: `${root}/manifest`,
    mimeType: got.mimeType,
    bytes: got.bytes,
    sha256: got.sha256,
    expiresAt: got.expiresAt,
    links: []
  });
}

module.exports = { blobManifest };
