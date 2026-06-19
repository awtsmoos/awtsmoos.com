// B"H
import { getBrowserLocalTunnelBridge } from "./browserLocalTunnelBridge.js";
import { EndpointTunnelBridge, makeVirtualOsTunnelBridge } from "./endpointTunnelBridge.js";

/**
 * B"H
 * Chapter 417: The bridge learned which worlds may touch loopback.
 *
 * A public HTTPS page is not a local cave. Chrome seals 127.0.0.1 behind the
 * private-network gate, so the default must be direct provider traffic unless
 * the caller explicitly chooses endpoint, virtual OS, or a genuinely local page.
 */
export async function resolveProviderTunnelBridge(options = {}) {
  const mode = tunnelMode(options);
  if (options.localTunnel === false || mode === "direct") return null;
  if (mode === "endpoint" || mode === "awtsmoos") return endpointBridge(options);
  if (mode === "virtual-os" || mode === "virtual") return virtualBridge(options);
  if (mode === "local" && canUseBrowserLocalTunnel(options)) return await getBrowserLocalTunnelBridge();
  return null;
}

export function tunnelMode(options = {}) {
  const explicit = options.tunnelMode || options.tunnelTransport || options.bridge;
  if (explicit) return String(explicit).toLowerCase();
  return canUseBrowserLocalTunnel(options) ? "local" : "direct";
}

export function canUseBrowserLocalTunnel(options = {}) {
  if (options.localTunnel === false) return false;
  if (options.allowPublicLocalTunnel === true) return true;
  const loc = options.location || globalThis.location;
  if (!loc) return false;
  const protocol = String(loc.protocol || "").toLowerCase();
  const host = String(loc.hostname || "").toLowerCase();
  return protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}

function endpointBridge(options = {}) {
  return new EndpointTunnelBridge({
    controlUrl: options.tunnelControlUrl,
    tunnelName: options.tunnelName,
    targetVessel: options.targetVessel,
    fetchImpl: options.fetchImpl
  });
}

function virtualBridge(options = {}) {
  return makeVirtualOsTunnelBridge({
    controlUrl: options.tunnelControlUrl,
    fetchImpl: options.fetchImpl
  });
}
