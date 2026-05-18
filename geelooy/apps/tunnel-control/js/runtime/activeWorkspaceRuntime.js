// B"H

/**
 * B"H
 * ActiveWorkspaceRuntime is the single living vessel: the tunnel is only a
 * bridge, while the workspace is the universe that receives roots, browser
 * sessions, permissions, mode, and AI context.
 *
 * @param {object} input Runtime input from session, tunnel, and mode choice.
 * @returns {object} Frozen normalized runtime model.
 */
export function createActiveWorkspaceRuntime(input = {}) {
  const tunnel = input.tunnel || {};
  const mode = input.mode || tunnel.mode || "local-agent";
  const activeRoot = String(input.activeRoot || tunnel.root || ".").trim() || ".";

  return Object.freeze({
    id: [mode, tunnel.tunnelName || "unmounted", activeRoot].join("::"),
    mode,
    tunnel: Object.freeze({
      name: tunnel.tunnelName || "",
      connected: tunnel.ok !== false && !!tunnel.tunnelName,
      raw: tunnel.raw || null
    }),
    roots: Object.freeze([activeRoot]),
    activeRoot,
    cwd: input.cwd || ".",
    browserSession: input.browserSession || null,
    mountedCapabilities: Object.freeze({
      files: mode === "local-agent" || mode === "browser-tab-editor",
      commands: mode === "local-agent" && !!tunnel.permissions?.allowCommands,
      browser: mode !== "virtual-os" || !!input.browserSession,
      virtualOs: mode === "virtual-os"
    }),
    semanticIndexStatus: input.semanticIndexStatus || "unmounted",
    workspaceMode: input.workspaceMode || "runtime-os",
    shellLayout: input.shellLayout || "tri-rail-desktop",
    authState: input.authState || {},
    aiContext: input.aiContext || {}
  });
}
