// B"H

function baseUrl(payload = {}) {
  return String(payload.controlBaseUrl || "https://awtsmoos.com/api/tunnel/control/fs/auto").replace(/\/fs\/[^/]+$/, "");
}

function encode(value) { return Buffer.from(String(value || ""), "utf8").toString("base64"); }

/**
 * B"H
 * Chapter: The native agent learned to ask the web-gate for a screen.
 *
 * These actions return canonical API URLs/payloads. The server-side Preview
 * Gateway owns policy, auth, AI permissions, and public/private visibility.
 */
function createPayload(payload, kind, extra = {}) {
  const target = payload.targetVessel || payload.tunnelName || "native-local";
  return {
    kind,
    title: payload.title || extra.title || "Awtsmoos Preview",
    path: payload.path || payload.p || extra.path || ".",
    actionId: payload.actionId || extra.actionId || "",
    tunnelName: payload.tunnelName || "auto",
    targetVessel: target,
    conversationId: payload.conversationId || "",
    conversationName: payload.conversationName || payload.conversation || "",
    visibility: payload.visibility || "private",
    ttlSeconds: payload.ttlSeconds || 3600,
    allowDownload: payload.allowDownload === true || payload.allowDownload === "true",
    allowFolderBrowse: payload.allowFolderBrowse !== false && payload.allowFolderBrowse !== "false",
    allowSearch: payload.allowSearch !== false && payload.allowSearch !== "false",
    createdBy: payload.createdBy || "ai",
    ai: payload.ai !== false,
    ...extra
  };
}

function previewUrl(payload, preview) {
  const b = baseUrl(payload);
  return `${b}/preview/create?preview64=${encode(JSON.stringify(preview))}`;
}

function buildPreviewActions(ctx) {
  const { payload } = ctx;
  return {
    async previewSettingsGet() { return { ok: true, action: "previewSettingsGet", url: `${baseUrl(payload)}/preview/settings` }; },
    async previewSettingsSet() { return { ok: true, action: "previewSettingsSet", url: `${baseUrl(payload)}/preview/settings/set`, settings: payload.settings || payload.content || {} }; },
    async previewList() { return { ok: true, action: "previewList", url: `${baseUrl(payload)}/preview/list` }; },
    async previewRevoke() { return { ok: true, action: "previewRevoke", url: `${baseUrl(payload)}/preview/revoke?previewId=${encodeURIComponent(payload.previewId || payload.id || "")}` }; },
    async previewCreate() { const preview = createPayload(payload, payload.kind || "file"); return { ok: true, action: "previewCreate", preview, url: previewUrl(payload, preview) }; },
    async previewFile() { const preview = createPayload(payload, "file"); return { ok: true, action: "previewFile", preview, url: previewUrl(payload, preview) }; },
    async previewFolder() { const preview = createPayload(payload, "folder"); return { ok: true, action: "previewFolder", preview, url: previewUrl(payload, preview) }; },
    async previewPage() { const preview = createPayload(payload, "page", { html: payload.html || payload.content || "", css: payload.css || "", data: payload.data || null }); return { ok: true, action: "previewPage", preview, url: previewUrl(payload, preview) }; },
    async previewCollection() { const preview = createPayload(payload, "collection", { items: payload.items || payload.files || [] }); return { ok: true, action: "previewCollection", preview, url: previewUrl(payload, preview) }; },
    async previewLiveCommand() { const preview = createPayload(payload, "live", { commandId: payload.commandId || payload.actionId || "" }); return { ok: true, action: "previewLiveCommand", preview, url: previewUrl(payload, preview) }; },
    async previewActionResult() { const preview = createPayload(payload, "action", { actionId: payload.actionId || payload.id || "" }); return { ok: true, action: "previewActionResult", preview, url: previewUrl(payload, preview) }; },
    async previewExposeLocalServer() { const url = payload.url || (payload.port ? `http://127.0.0.1:${payload.port}${payload.proxyPath || "/"}` : ""); const preview = createPayload(payload, "proxy", { url, port: payload.port || null, path: payload.proxyPath || "/" }); return { ok: true, action: "previewExposeLocalServer", preview, url: previewUrl(payload, preview), proxyUrl: `${baseUrl(payload)}/preview/${encodeURIComponent(payload.tunnelName || "auto")}?url64=${encode(url)}` }; }
  };
}

module.exports = { buildPreviewActions, createPayload, previewUrl };
