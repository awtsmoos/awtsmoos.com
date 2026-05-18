// B"H

function now() {
  return new Date().toISOString();
}

function createRuntimeManifest(runtime = {}, overrides = {}) {
  const kind = overrides.kind || runtime.kind || "unknown";
  const type = overrides.type || runtime.type || "unknown";
  return {
    schema: "awtsmoos.vibe.runtime",
    version: 1,
    createdAt: overrides.createdAt || now(),
    updatedAt: now(),
    projectPath: overrides.projectPath || overrides.root || "",
    kind,
    type,
    entry: overrides.entry || runtime.entry || null,
    command: overrides.command || runtime.command || null,
    port: overrides.port ?? runtime.port ?? null,
    urls: {
      local: overrides.localUrl || null,
      chatgptFetch: overrides.chatgptFetchUrl || null,
      logs: overrides.logsUrl || null,
      stop: overrides.stopUrl || null,
      restart: overrides.restartUrl || null,
      public: overrides.publicUrl || null
    },
    runtime: {
      virtualFirst: true,
      supportsOfflineBrowserStorage: true,
      supportsBackend: kind === "backend" || kind === "fullstack",
      supportsStaticPreview: kind === "static" || kind === "frontend" || kind === "fullstack",
      processMode: kind === "backend" || kind === "fullstack" ? "virtual-node-or-tunnel" : "static-server"
    },
    safety: {
      requiresUserMachineForLocalhost: !!overrides.localUrl,
      tunnelMediated: !!overrides.chatgptFetchUrl,
      publicUrlRequiresBroker: !overrides.publicUrl
    },
    metadata: overrides.metadata || {}
  };
}

function withPreview(manifest, preview = {}) {
  return {
    ...manifest,
    updatedAt: now(),
    previewId: preview.id || manifest.previewId || null,
    status: preview.status || manifest.status || "running",
    urls: {
      ...(manifest.urls || {}),
      local: preview.localUrl || preview.url || manifest.urls?.local || null,
      chatgptFetch: preview.chatgptFetchUrl || manifest.urls?.chatgptFetch || null,
      logs: preview.chatgptLogsUrl || preview.logsUrl || manifest.urls?.logs || null,
      stop: preview.chatgptStopUrl || preview.stopUrl || manifest.urls?.stop || null,
      restart: preview.chatgptRestartUrl || preview.restartUrl || manifest.urls?.restart || null,
      public: preview.publicUrl || manifest.urls?.public || null
    }
  };
}

module.exports = { createRuntimeManifest, withPreview };
