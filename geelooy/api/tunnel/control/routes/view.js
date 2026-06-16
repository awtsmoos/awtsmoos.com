// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { findPreviewAny, getPreview } = require("../preview/previewStore.js");
const { renderPreview } = require("../preview/previewRenderer.js");

/**
 * B"H
 * Chapter: /view became the screen beyond the chat box.
 */
async function view($i, vars = {}) {
  const ident = currentIdentity($i);
  const previewId = vars.previewId;
  const found = findPreviewAny(previewId);
  if (!found) return renderMissing(previewId);
  const preview = found.preview;
  const privateAccess = preview.visibility === "private";
  if (privateAccess && (!ident.ok || ident.userId !== preview.ownerUserId)) return renderDenied(previewId);
  const counted = getPreview(found.userId, previewId, { countOpen: true });
  if (!counted) return renderMissing(previewId);
  return renderPreview(counted);
}

async function viewRaw($i, vars = {}) {
  const ident = currentIdentity($i);
  const found = findPreviewAny(vars.previewId);
  if (!found) return json($i, { BH: "B\"H", ok: false, error: "preview_not_found" }, 404);
  if (found.preview.visibility === "private" && (!ident.ok || ident.userId !== found.preview.ownerUserId)) return json($i, { BH: "B\"H", ok: false, error: "preview_denied" }, 403);
  return json($i, found.preview);
}

async function viewWs($i, vars = {}) {
  return json($i, { BH: "B\"H", ok: true, previewId: vars.previewId, websocket: "planned", message: "Preview-specific websocket channel is reserved. Current live frames are available in tunnel-control LIVE traffic." });
}

function renderMissing(id) {
  return htmlPacket(404, `<!doctype html><h1>Preview not found</h1><p>${escapeHtml(id)}</p>`);
}

function renderDenied(id) {
  return htmlPacket(403, `<!doctype html><h1>Private preview</h1><p>Log in as the owner to view ${escapeHtml(id)}.</p>`);
}

function htmlPacket(statusCode, body) {
  return { statusCode, mimeType: "text/html; charset=utf-8", headers: { "Cache-Control": "private, no-store, max-age=0" }, response: body, body };
}

function escapeHtml(value) { return String(value || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

module.exports = { view, viewRaw, viewWs };
