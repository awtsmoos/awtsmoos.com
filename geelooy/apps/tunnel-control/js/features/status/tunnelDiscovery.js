// B"H

import { $ } from "../../lib/dom.js";
import { rememberTunnelName } from "../../state/state.js";

/**
 * B"H
 * Chapter 377: Tunnel Discovery Became A Single Clear Door.
 */
export function extractTunnelName(got) {
  if (!got) return "";

  return (
    got.tunnelName ||
    got.device?.tunnelName ||
    got.tunnel?.tunnelName ||
    got.device?.name ||
    got.name ||
    ""
  );
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
