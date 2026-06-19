// B"H
const { json, text } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { findPreviewAny, getPreview } = require("../preview/previewStore.js");
const { renderPreview } = require("../preview/previewRenderer.js");
const { boundedTunnelTimeout } = require("./protectedFs.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");

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
  return renderPreview(counted, await dynamicPreviewData($i, found.userId, counted));
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

async function viewProxy($i, vars = {}) {
  const access = previewAccess($i, vars.previewId);
  if (!access.ok) return access.packet;
  const preview = access.preview;
  const source = preview.source || {};
  const rootUrl = source.url || (source.port ? `http://127.0.0.1:${source.port}${source.path || "/"}` : "");
  const url = proxyRequestUrl($i, rootUrl);
  if (!url) return json($i, { BH: "B\"H", ok: false, error: "preview_proxy_missing_url" }, 400);
  const payload = {
    kind: "fs",
    action: "httpRequest",
    url,
    method: "GET",
    responseBodyMode: "text",
    maxChars: 800000,
    targetVessel: preview.targetVessel,
    conversationId: preview.conversationId,
    conversationName: preview.conversationName
  };
  const result = await resolveFsVessel({ $i, userId: access.userId, tunnelName: preview.tunnelName || "auto", payload, timeoutMs: boundedTunnelTimeout(30000) }).send();
  if (result.ok === false) return json($i, result, result.status || 502);
  const mime = result.contentType || result.headers?.["content-type"] || "text/html; charset=utf-8";
  const rawBody = result.body || result.content || result.text || "";
  const body = isHtmlMime(mime) ? rewriteHtmlForProxy(rawBody, url, preview.id) : rawBody;
  return text($i, body, mime, result.status || 200);
}

function previewAccess($i, previewId) {
  const ident = currentIdentity($i);
  const found = findPreviewAny(previewId);
  if (!found) return { ok: false, packet: json($i, { BH: "B\"H", ok: false, error: "preview_not_found" }, 404) };
  if (found.preview.visibility === "private" && (!ident.ok || ident.userId !== found.preview.ownerUserId)) return { ok: false, packet: json($i, { BH: "B\"H", ok: false, error: "preview_denied" }, 403) };
  return { ok: true, userId: found.userId, preview: found.preview };
}

async function dynamicPreviewData($i, userId, preview) {
  if (!["file", "folder"].includes(preview.kind)) return {};
  if (preview.kind === "folder" && preview.allowFolderBrowse === false) return { ok: false, error: "folder_browse_disabled" };
  const payload = {
    kind: "fs",
    action: preview.kind === "folder" ? "list" : "read",
    path: preview.source?.path || ".",
    maxChars: 200000,
    targetVessel: preview.targetVessel,
    conversationId: preview.conversationId,
    conversationName: preview.conversationName
  };
  try {
    return await resolveFsVessel({ $i, userId, tunnelName: preview.tunnelName || "auto", payload, timeoutMs: boundedTunnelTimeout(30000) }).send();
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function renderMissing(id) {
  return htmlPacket(404, `<!doctype html><h1>Preview not found</h1><p>${escapeHtml(id)}</p>`);
}

function renderDenied(id) {
  return htmlPacket(403, `<!doctype html><h1>Private preview</h1><p>Log in as the owner to view ${escapeHtml(id)}.</p>`);
}

function proxyRequestUrl($i, fallbackUrl) {
  const q = $i?.paramKinds?.GET || $i?.$_GET || {};
  return from64(q.url64) || q.url || fallbackUrl;
}

function from64(value) {
  if (!value) return "";
  try {
    return Buffer.from(String(value), "base64").toString("utf8");
  } catch (_error) {
    return "";
  }
}

function isHtmlMime(mime) {
  return /text\/html|application\/xhtml\+xml/i.test(String(mime || ""));
}

function rewriteHtmlForProxy(html, baseUrl, previewId) {
  const id = encodeURIComponent(previewId || "");
  return String(html || "")
    .replace(/\s(src|href|action|poster)=("|')([^"']+)\2/gi, (match, attr, quote, value) => {
      const next = proxiedAssetUrl(value, baseUrl, id);
      return next ? ` ${attr}=${quote}${next}${quote}` : match;
    })
    .replace(/url\((["']?)([^"')]+)\1\)/gi, (match, quote, value) => {
      const next = proxiedAssetUrl(value, baseUrl, id);
      return next ? `url(${quote}${next}${quote})` : match;
    });
}

function proxiedAssetUrl(value, baseUrl, encodedPreviewId) {
  const raw = String(value || "").trim();
  if (!raw || raw.startsWith("#") || /^(data|blob|mailto|tel|javascript):/i.test(raw)) return "";
  try {
    const resolved = new URL(raw, baseUrl).toString();
    const packed = Buffer.from(resolved, "utf8").toString("base64");
    return `/view/${encodedPreviewId}/proxy?url64=${encodeURIComponent(packed)}`;
  } catch (_error) {
    return "";
  }
}

function htmlPacket(statusCode, body) {
  return { statusCode, mimeType: "text/html; charset=utf-8", headers: { "Cache-Control": "private, no-store, max-age=0" }, response: body, body };
}

function escapeHtml(value) { return String(value || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

module.exports = { rewriteHtmlForProxy, view, viewProxy, viewRaw, viewWs };
