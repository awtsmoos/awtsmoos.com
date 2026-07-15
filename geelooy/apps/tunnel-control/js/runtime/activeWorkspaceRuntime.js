// B"H

/**
 * ActiveWorkspaceRuntime preserves the normalized identity and permission truth
 * needed by the dashboard instead of hiding it inside an opaque raw envelope.
 *
 * @param {object} input Runtime input from session, tunnel, and mode choice.
 * @returns {object} Frozen normalized runtime model.
 */
export function createActiveWorkspaceRuntime(input = {}) {
  const source = input.tunnel || {};
  const permissions = normalizePermissions(source);
  const mode = input.mode || source.mode || "local-agent";
  const activeRoot = String(input.activeRoot || source.root || ".").trim() || ".";
  const tunnelName = String(source.tunnelName || source.name || "").trim();
  const vesselType = String(
    source.vesselType ||
    source.raw?.vesselType ||
    source.raw?.device?.vesselType ||
    "native-local"
  );

  return Object.freeze({
    id: [mode, tunnelName || "unmounted", activeRoot].join("::"),
    mode,
    tunnel: Object.freeze({
      name: tunnelName,
      connected: source.ok !== false && !!tunnelName,
      root: activeRoot,
      vesselType,
      permissions,
      allowWrite: permissions.allowWrite,
      allowCommands: permissions.allowCommands,
      allowBrowser: permissions.allowBrowser,
      allowSecrets: permissions.allowSecrets,
      raw: source.raw || null
    }),
    roots: Object.freeze([activeRoot]),
    activeRoot,
    cwd: input.cwd || ".",
    browserSession: input.browserSession || null,
    mountedCapabilities: Object.freeze({
      files: mode === "local-agent" || mode === "browser-tab-editor",
      commands: mode === "local-agent" && permissions.allowCommands,
      browser: mode !== "virtual-os" || !!input.browserSession,
      virtualOs: mode === "virtual-os"
    }),
    semanticIndexStatus: input.semanticIndexStatus || "unmounted",
    workspaceMode: input.workspaceMode || "runtime-os",
    shellLayout: input.shellLayout || "single-scroll-command-center",
    authState: input.authState || {},
    aiContext: input.aiContext || {}
  });
}

function normalizePermissions(tunnel) {
  const source = tunnel.permissions || tunnel.liveConfig || tunnel.config || {};
  return Object.freeze({
    allowWrite: !!source.allowWrite,
    allowCommands: !!source.allowCommands,
    allowBrowser: !!source.allowBrowser,
    allowSecrets: !!source.allowSecrets,
    allowHttpProxy: !!(source.allowHttpProxy || source.enableLocalHttpProxy)
  });
}
