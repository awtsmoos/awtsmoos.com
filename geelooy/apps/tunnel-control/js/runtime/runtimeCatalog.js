// B"H

import { TUNNEL_MODES } from "../tunnels/modes.js";

/**
 * B"H
 * Builds selectable runtime universes from known transport modes.
 *
 * @param {object} runtime Active runtime model.
 * @returns {object[]} Runtime cards.
 */
export function runtimeCatalog(runtime = {}) {
  return TUNNEL_MODES.map(mode => ({
    id: mode.id,
    title: mode.title,
    description: mode.description,
    cta: mode.cta,
    href: mode.href || "",
    active: mode.id === runtime.mode,
    connected: mode.id === "local-agent" ? !!runtime.tunnel?.connected : false
  }));
}
