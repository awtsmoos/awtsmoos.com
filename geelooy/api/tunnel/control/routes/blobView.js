// B"H
const { getBlob } = require("../core/blobStore.js");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlResponse(body, status = 200) {
  return {
    statusCode: status,
    mimeType: "text/html; charset=utf-8",
    headers: { "Cache-Control": "private, no-store, max-age=0" },
    body
  };
}

/**
 * B"H
 * Serves a human and AI-readable HTML surface for one response blob.
 *
 * The raw blob remains the machine river. This page is the lantern beside it:
 * a stable-looking document with metadata, a raw JSON link, and visible text so
 * browser-like readers can treat tunnel output as ordinary web hypermedia.
 *
 * @param {object} $i Awtsmoos request vessel.
 * @param {object} vars Route variables containing blobId.
 * @returns {object} Awtsmoos HTML response.
 */
async function blobView($i, vars = {}) {
  const got = getBlob(vars.blobId);
  if (!got) {
    return htmlResponse("<!doctype html><title>Awtsmoos Blob Expired</title><h1>Blob expired</h1>", 404);
  }

  const rawUrl = `/api/tunnel/control/blob/${encodeURIComponent(vars.blobId)}`;
  const title = `Awtsmoos Tunnel Result ${escapeHtml(vars.blobId)}`;
  const body = escapeHtml(got.body);

  return htmlResponse(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="robots" content="noindex,nofollow">
<meta name="awtsmoos-kind" content="tunnel-response-blob">
<meta name="awtsmoos-sha256" content="${escapeHtml(got.sha256)}">
<link rel="alternate" type="application/json" href="${rawUrl}">
</head>
<body>
<main>
<h1>${title}</h1>
<p>Raw JSON: <a href="${rawUrl}">${rawUrl}</a></p>
<dl>
<dt>Bytes</dt><dd>${got.bytes}</dd>
<dt>SHA-256</dt><dd><code>${escapeHtml(got.sha256)}</code></dd>
<dt>Expires At</dt><dd>${new Date(got.expiresAt).toISOString()}</dd>
<dt>MIME</dt><dd>${escapeHtml(got.mimeType)}</dd>
</dl>
<pre>${body}</pre>
</main>
</body>
</html>`);
}

module.exports = { blobView };
