// B"H
import { getBrowserLocalTunnelBridge } from "./browserLocalTunnelBridge.js";
import { EndpointTunnelBridge, makeVirtualOsTunnelBridge } from "./endpointTunnelBridge.js";

/**
 * B"H — One decision gate for provider tool transport.
 * MiniMax, OpenRouter, Groq, and friends may use local tunnel, Awtsmoos OAuth
 * endpoint tunnel, Virtual OS endpoint, or direct provider calls.
 */
export async function resolveProviderTunnelBridge(options = {}) {
  if (options.localTunnel === false || tunnelMode(options) === "direct") return null;
  const mode = tunnelMode(options);
  if (mode === "endpoint" || mode === "awtsmoos") return endpointBridge(options);
  if (mode === "virtual-os" || mode === "virtual") return virtualBridge(options);
  return await getBrowserLocalTunnelBridge();
}

export function tunnelMode(options = {}) {
  return String(options.tunnelMode || options.tunnelTransport || options.bridge || "local").toLowerCase();
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
