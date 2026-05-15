
// B"H

import { many } from "../ui/core/html.js";

/**
 * B"H
 * Gets the active pane key.
 *
 * @returns {string} Active pane key.
 */
export function getActivePane() {
  return many("[data-pane]").find(p => p.classList.contains("active"))?.dataset.pane || "";
}

/**
 * B"H
 * Ensures one pane is active.
 *
 * @returns {void}
 */
export function ensureActivePane() {
  const panes = many("[data-pane]");
  if (!panes.length || getActivePane()) return;

  const preferred = panes.find(p => p.dataset.pane === "setup") || panes[0];
  preferred.classList.add("active");

  const tab = many("[data-tab]").find(t => t.dataset.tab === preferred.dataset.pane);
  tab?.classList.add("active");
}

/**
 * B"H
 * Activates a pane through the old tab button when possible.
 *
 * @param {string} pane Pane name.
 * @returns {void}
 */
export function activatePane(pane) {
  const tab = many("[data-tab]").find(t => t.dataset.tab === pane);

  if (tab) {
    tab.click();
  } else {
    for (const node of many("[data-pane]")) {
      node.classList.toggle("active", node.dataset.pane === pane);
    }
  }

  document.dispatchEvent(new CustomEvent("awt:pane-change", {
    detail: { pane }
  }));
}
