// B"H
import { makeVirtualOSTunnelAgent } from "./tunnel/agent.js";

export const VirtualOSTunnelAgent = makeVirtualOSTunnelAgent();

if (typeof window !== "undefined") {
  window.VirtualOSTunnelAgent = VirtualOSTunnelAgent;
  if (window.localStorage?.getItem("awtsmoos.os.tunnel.enabled") === "true") {
    VirtualOSTunnelAgent.start().catch(console.error);
  }
}

/**
 * B"H
 * This public wrapper remains the old doorway, so every existing import still
 * enters safely. Behind it, the tunnel has become many small rooms instead of
 * one compressed hallway.
 */
