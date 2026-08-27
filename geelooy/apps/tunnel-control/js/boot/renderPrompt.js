
// B"H

import { $ } from "../lib/dom.js";
import { buildPrompt } from "../features/prompt.js";

/**
 * B"H
 * Renders the AI prompt box.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
export function renderPrompt(getTunnelName) {
  if (!$("promptBox")) return;

  $("promptBox").textContent = buildPrompt({
    tunnelName: getTunnelName(),
    projectPath: $("projectPath")?.value.trim() || ".",
    mode: $("promptMode")?.value || "general"
  });
}
