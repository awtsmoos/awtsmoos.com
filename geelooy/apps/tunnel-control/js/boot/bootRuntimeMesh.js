// B"H

import { createVirtualRuntime } from "../runtime/virtualRuntime.js";
import { registerRuntime, restoreActiveRuntime } from "../runtime/runtimeRegistry.js";
import { registerDiscoveredTunnelRuntimes } from "../runtime/tunnelRuntimeHydrator.js";

/**
 * B"H
 * Chapter 415: Runtime Mesh Boot Became A Separate Star.
 */
export function hydrateRuntimeMesh(localRuntime, discoveredRaw = null) {
  registerRuntime(localRuntime);
  const activeRaw = localRuntime.tunnel?.raw ? { ...localRuntime.tunnel.raw, tunnelName: localRuntime.tunnel.name } : localRuntime;
  registerDiscoveredTunnelRuntimes(activeRaw, localRuntime.authState);
  if (discoveredRaw) registerDiscoveredTunnelRuntimes({ ...activeRaw, raw: discoveredRaw }, localRuntime.authState);
  registerRuntime(createVirtualRuntime());

  const active = restoreActiveRuntime() || localRuntime;
  window.awtsActiveWorkspaceRuntime = active;
  document.body.dataset.awtRuntimeMode = active.mode;
  return active;
}
