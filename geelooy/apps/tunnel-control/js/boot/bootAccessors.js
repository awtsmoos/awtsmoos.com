// B"H

import { $ } from "../lib/dom.js";
import { state } from "../state/state.js";

/**
 * B"H
 * Chapter 413: Boot Accessors Became Small Windows.
 */
export function getTunnelName() {
  return $("tunnelName") ? $("tunnelName").value.trim() : state.tunnelName;
}

export function getProjectPath() {
  return $("projectPath")?.value.trim() || state.projectPath || ".";
}
