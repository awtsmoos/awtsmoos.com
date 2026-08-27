
// B"H

import { $ } from "../lib/dom.js";
import { rememberTunnelName, rememberProjectPath } from "../state/state.js";
import { refreshDevice, refreshStatus } from "../features/status.js";
import { renderPrompt } from "./renderPrompt.js";

/**
 * B"H
 * Wires old form controls into the new no-query flow.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
export function wireInputs(getTunnelName) {
  $("tunnelName")?.addEventListener("input", () => {
    rememberTunnelName(getTunnelName());
    renderPrompt(getTunnelName);
    refreshDevice(getTunnelName);
  });

  $("projectPath")?.addEventListener("input", () => {
    rememberProjectPath($("projectPath").value);
    renderPrompt(getTunnelName);
  });

  $("promptMode")?.addEventListener("change", () => renderPrompt(getTunnelName));

  $("refreshBtn")?.addEventListener("click", () => {
    refreshStatus(getTunnelName);
  });

  $("refreshDeviceBtn")?.addEventListener("click", () => {
    refreshDevice(getTunnelName);
  });

  $("copyPromptBtn")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText($("promptBox")?.textContent || "");
  });
}
