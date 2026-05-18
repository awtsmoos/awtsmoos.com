// B"H

import { createActiveWorkspaceRuntime } from "./activeWorkspaceRuntime.js";
import { registerRuntime } from "./runtimeRegistry.js";
import { extractTunnelName, extractRoot, extractPermissions } from "../tunnels/extractTunnel.js";

function possibleTunnelList(raw) {
  return [
    raw?.tunnels,
    raw?.devices,
    raw?.connectedTunnels,
    raw?.connectedDevices,
    raw?.raw?.tunnels,
    raw?.raw?.devices
  ].find(Array.isArray) || [];
}

/**
 * B"H
 * Registers additional local tunnel runtimes from raw server payloads.
 *
 * @param {object} resolvedTunnel Active resolved tunnel.
 * @param {object} session Session state.
 * @returns {object[]} Registered additional runtimes.
 */
export function registerDiscoveredTunnelRuntimes(resolvedTunnel, session = {}) {
  const found = [];

  for (const raw of possibleTunnelList(resolvedTunnel.raw || resolvedTunnel)) {
    const tunnelName = extractTunnelName(raw);
    if (!tunnelName || tunnelName === resolvedTunnel.tunnelName) continue;

    const runtime = createActiveWorkspaceRuntime({
      tunnel: {
        ok: true,
        tunnelName,
        root: extractRoot(raw),
        permissions: extractPermissions(raw),
        raw
      },
      activeRoot: extractRoot(raw),
      authState: session,
      workspaceMode: "runtime-os"
    });

    registerRuntime(runtime);
    found.push(runtime);
  }

  return found;
}
