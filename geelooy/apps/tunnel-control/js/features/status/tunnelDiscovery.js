// B"H

import { $ } from "../../lib/dom.js";
import { rememberTunnelName } from "../../state/state.js";

/**
 * B"H
 * Chapter 22: Discovery learned the recommended vessel.
 */
export function extractTunnelName(got) {
  if (!got) return "";
  return got.recommended?.tunnelName || got.tunnelName || got.device?.tunnelName || got.tunnel?.tunnelName || got.device?.name || got.name || got.virtualDevice?.tunnelName || "";
}

export function applyDiscoveredTunnelName(got, getTunnelName) {
  const current = getTunnelName();
  if (current) return current;
  const discovered = extractTunnelName(got);
  if (!discovered) return "";
  const field = $("tunnelName");
  if (field) field.value = discovered;
  rememberTunnelName(discovered);
  return discovered;
}
