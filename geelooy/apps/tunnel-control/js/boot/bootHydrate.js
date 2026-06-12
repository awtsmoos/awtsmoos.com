// B"H

import { $ } from "../lib/dom.js";
import { state, rememberTunnelName, rememberProjectPath } from "../state/state.js";

/**
 * B"H
 * Chapter 414: Boot Hydration Became A Clear Vessel.
 */
export function hydrateFields(tunnel) {
  rememberTunnelName(tunnel.tunnelName);
  rememberProjectPath(tunnel.root || state.projectPath || ".");

  if ($("tunnelName")) $("tunnelName").value = state.tunnelName;
  if ($("projectPath")) $("projectPath").value = state.projectPath;
}

export function hydratePermissionClasses(tunnel) {
  const p = tunnel.permissions || {};
  document.body.classList.toggle("awt-can-write", !!p.allowWrite);
  document.body.classList.toggle("awt-can-command", !!p.allowCommands);
  document.body.classList.toggle("awt-can-browser", !!p.allowBrowser);
}
