// B"H
const { getHandoff, publicPayload } = require("../core/handoffStore.js");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"]/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
  }[ch]));
}

function response(body, mimeType, statusCode = 200) {
  return {
    statusCode,
    mimeType,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
    body
  };
}

/**
 * B"H
 * Stable ChatGPT handoff URL for the latest result of one tunnel.
 * Paste this URL once; later tunnel actions replace the inner payload.
 *
 * @param {object} $i Awtsmoos request vessel.
 * @param {object} vars Route variables containing tunnelName.
 * @returns {object} HTML response with embedded latest JSON.
 */
async function handoff($i, vars = {}) {
  const slot = getHandoff(vars.tunnelName);
  const url = `/api/tunnel/control/handoff/${encodeURIComponent(vars.tunnelName || "")}`;

  if (!slot) {
    return response(`<!doctype html><html><head><title>Awtsmoos Handoff Pending</title></head><body>
<h1>Awtsmoos Handoff Pending</h1>
<p>No result has reached this handoff slot yet. Run a tunnel action, then read this same URL again.</p>
<p><code>${escapeHtml(url)}</code></p>
</body></html>`, "text/html; charset=utf-8", 202);
  }

  const json = publicPayload(slot);
  return response(`<!doctype html><html><head>
<meta charset="utf-8"><title>Awtsmoos Handoff ${escapeHtml(slot.tunnelName)}</title>
<meta name="robots" content="noindex,nofollow">
<meta name="awtsmoos-kind" content="tunnel-handoff">
</head><body>
<h1>Awtsmoos Handoff</h1>
<p>Version ${slot.version}. Latest action: <code>${escapeHtml(slot.action)}</code>.</p>
<pre>${escapeHtml(json)}</pre>
</body></html>`, "text/html; charset=utf-8");
}

module.exports = { handoff };
