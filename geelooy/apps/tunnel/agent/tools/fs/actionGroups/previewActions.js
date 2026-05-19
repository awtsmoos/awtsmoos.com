// B"H

const { staticServerStart, staticServerStop, staticServerLogs } = require("../staticServers.js");
const { create, get, list, stop } = require("../previewRegistry.js");
const { detectRuntime } = require("../runtimeDetect.js");
const { createRuntimeManifest, withPreview } = require("../runtimeManifest.js");
const { safePath } = require("../pathGuard.js");


function absRoot(config, payload) {
    const requested = payload.path || payload.p || payload.root || ".";
    return safePath(config, requested);
}

function controlUrl(payload, action, extra = {}) {
    if (!payload.controlBaseUrl) return "";
    const params = new URLSearchParams({ action, ...extra });
    return payload.controlBaseUrl + "?" + params.toString();
}

function previewProxyUrl(payload, url) {
    if (!payload.tunnelName || !url) return "";
    const base = "https://awtsmoos.com/api/tunnel/control/preview/" + encodeURIComponent(payload.tunnelName);
    const params = new URLSearchParams({ url64: Buffer.from(String(url), "utf8").toString("base64") });
    return base + "?" + params.toString();
}

function localPreviewUrl(runtime, server) {
    if (server?.url) return server.url;
    if (runtime.port) return `http://localhost:${runtime.port}/`;
    return "";
}

function previewDescriptor(payload, preview, server = null) {
    const url = preview.url || localPreviewUrl(preview.runtime, server);
    const publicUrl = preview.publicUrl || previewProxyUrl(payload, url);
    const hydrated = {
        ...preview,
        url,
        localUrl: url,
        publicUrl,
        chatgptFetchUrl: url
            ? controlUrl(payload, "httpRequest", { url, method: "GET", maxChars: payload.maxChars || 12000 })
            : "",
        chatgptLogsUrl: controlUrl(payload, "previewLogs", { id: preview.id }),
        chatgptStopUrl: controlUrl(payload, "stopPreview", { id: preview.id }),
        chatgptRestartUrl: controlUrl(payload, "restartPreview", { id: preview.id })
    };

    return {
        ...hydrated,
        manifest: withPreview(preview.manifest || createRuntimeManifest(preview.runtime, {
            projectPath: preview.root,
            localUrl: url,
            publicUrl,
            chatgptFetchUrl: hydrated.chatgptFetchUrl
        }), hydrated),
        note: "localUrl opens on the user's machine. chatgptFetchUrl lets ChatGPT fetch the preview through the authenticated tunnel action."
    };
}

function buildPreviewActions(ctx) {
    const { config, payload } = ctx;

    return {
        async inspectRuntime() {
            const root = absRoot(config, payload);
            const runtime = detectRuntime(root);
            const manifest = createRuntimeManifest(runtime, { projectPath: root });
            return {
                ok: true,
                action: "inspectRuntime",
                root,
                runtime,
                manifest
            };
        },

        async launchPreview() {
            const root = absRoot(config, payload);
            const runtime = detectRuntime(root);
            const id = payload.id || `preview-${Date.now()}`;
            let server = null;

            if (runtime.kind === "static" || runtime.kind === "frontend" || runtime.kind === "fullstack") {
                const port = Number(payload.port || runtime.port || 5180);
                server = await staticServerStart(config, {
                    ...payload,
                    path: payload.path || payload.p || ".",
                    port,
                    host: payload.host || "127.0.0.1",
                    index: payload.index || "index.html",
                    spaFallback: payload.spaFallback !== false,
                    cors: payload.cors === true,
                    serverId: payload.serverId || id
                });
            }

            const url = localPreviewUrl(runtime, server);
            const publicUrl = previewProxyUrl(payload, url);
            const manifest = createRuntimeManifest(runtime, {
                projectPath: root,
                entry: runtime.entry || null,
                port: server?.port || runtime.port || null,
                localUrl: url,
                publicUrl,
                chatgptFetchUrl: url ? controlUrl(payload, "httpRequest", { url, method: "GET", maxChars: payload.maxChars || 12000 }) : "",
                logsUrl: controlUrl(payload, "previewLogs", { id }),
                stopUrl: controlUrl(payload, "stopPreview", { id }),
                restartUrl: controlUrl(payload, "restartPreview", { id })
            });

            const preview = create({
                id,
                root,
                runtime,
                status: server?.ok === false ? "error" : "running",
                url,
                localUrl: url,
                publicUrl,
                serverId: server?.serverId || null,
                manifest,
                logs: [
                    `Detected runtime: ${runtime.kind}/${runtime.type}`,
                    server?.url ? `Static preview server: ${server.url}` : `Preview URL: ${url || "none"}`
                ]
            });

            return {
                ok: preview.status !== "error",
                action: "launchPreview",
                preview: previewDescriptor(payload, preview, server)
            };
        },

        async listPreviews() {
            return {
                ok: true,
                action: "listPreviews",
                previews: list().map(preview => previewDescriptor(payload, preview))
            };
        },

        async previewLogs() {
            const preview = get(payload.id);
            if (!preview) return { ok: false, action: "previewLogs", error: "preview_not_found", id: payload.id };
            let serverLogs = null;
            if (preview.serverId) serverLogs = await staticServerLogs({ serverId: preview.serverId, maxLogs: payload.maxLogs || 200 });
            return {
                ok: true,
                action: "previewLogs",
                id: payload.id,
                logs: preview.logs || [],
                serverLogs
            };
        },

        async stopPreview() {
            const preview = stop(payload.id);
            if (preview?.serverId) await staticServerStop({ serverId: preview.serverId });
            return { ok: !!preview, action: "stopPreview", preview };
        },

        async restartPreview() {
            const old = payload.id ? stop(payload.id) : null;
            if (old?.serverId) await staticServerStop({ serverId: old.serverId });
            return await this.launchPreview();
        }
    };
}

module.exports = { buildPreviewActions };
