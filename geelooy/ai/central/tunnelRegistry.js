// B"H
import { DEFAULT_SAFE_ACTIONS, makeToolSchemas } from "./toolSchemas.js";

/**
 * B"H
 * Chapter 27: Three tunnels stood at the gate: native, editor, and OS.
 *
 * Tool names are namespaced so every agent can see every vessel without name
 * collisions. `native.read`, `editor.read`, and `virtualOs.snapshot` can all
 * live in one model prompt, even when the model only knows plain text JSON.
 */
export class AllTunnelRegistry {
  constructor(tunnels = []) { this.tunnels = tunnels.filter(Boolean); }

  static defaultNative(bridge) {
    return new AllTunnelRegistry([{ id: "native", label: "Native Awtsmoos Tunnel", actions: DEFAULT_SAFE_ACTIONS, bridge }]);
  }

  add(tunnel) { this.tunnels.push(tunnel); return this; }

  schemas() { return makeToolSchemas(this.names()); }

  names() { return this.tunnels.flatMap(t => (t.actions || []).map(action => `${t.id}.${action}`)); }

  async call(name, args = {}) {
    const [id, ...rest] = String(name).split(".");
    const action = rest.join(".") || args.action || name;
    const tunnel = this.tunnels.find(item => item.id === id) || this.tunnels[0];
    if (!tunnel?.bridge?.call) throw new Error(`No bridge for tunnel tool: ${name}`);
    return await tunnel.bridge.call(action, { ...args, action });
  }
}

/**
 * B"H
 * Makes lightweight descriptors for browser tunnels that are discovered later.
 *
 * @param {string} id Tunnel id.
 * @param {string[]} actions Action list.
 * @returns {object} Descriptor without bridge.
 */
export function browserTunnelDescriptor(id, actions = DEFAULT_SAFE_ACTIONS) {
  return { id, label: `${id} browser tunnel`, actions };
}
