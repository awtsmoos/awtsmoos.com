// B"H

import { getActiveRuntime } from "./runtimeRegistry.js";

const PANE_CAPABILITY = {
  explorer: "files",
  terminal: "commands",
  chrome: "browser",
  usage: "files"
};

function message(pane, capability, runtime) {
  return `The ${pane} pane needs ${capability}, but ${runtime?.label || runtime?.id || "this runtime"} does not expose it.`;
}

/**
 * B"H
 * Applies capability notices to panes for the active runtime.
 *
 * @returns {void}
 */
export function applyCapabilityGuards() {
  const runtime = getActiveRuntime();
  const caps = runtime?.mountedCapabilities || {};

  for (const [pane, capability] of Object.entries(PANE_CAPABILITY)) {
    const node = document.querySelector(`[data-pane="${pane}"]`);
    if (!node) continue;

    let notice = node.querySelector(".awt-capability-notice");
    const allowed = !!caps[capability];

    node.classList.toggle("awt-capability-blocked", !allowed);

    if (allowed) {
      notice?.remove();
      continue;
    }

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "notice awt-capability-notice";
      node.prepend(notice);
    }

    notice.textContent = message(pane, capability, runtime);
  }
}
