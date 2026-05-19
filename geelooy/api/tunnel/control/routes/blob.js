// B"H
const { getBlob } = require("../core/blobStore.js");

function textResponse(body, status, mimeType, headers = {}) {
  return {
    statusCode: status,
    mimeType,
    headers,
    body
  };
}

/**
 * B"H
 * Serves one short-lived response body created by protectedFs.
 *
 * @param {object} $i Awtsmoos request vessel.
 * @param {object} vars Route variables.
 * @returns {object} Wrapped Awtsmoos response.
 */
async function blob($i, vars = {}) {
  const got = getBlob(vars.blobId);
  if (!got) {
    return textResponse(JSON.stringify({ ok: false, error: "blob_not_found_or_expired" }, null, 2), 404, "application/json; charset=utf-8", {
      "Cache-Control": "no-store"
    });
  }

  return textResponse(got.body, 200, got.mimeType, {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Awtsmoos-Blob-Bytes": String(got.bytes),
    "X-Awtsmoos-Blob-Sha256": got.sha256,
    "X-Awtsmoos-Blob-Expires-At": String(got.expiresAt)
  });
}

module.exports = { blob };
