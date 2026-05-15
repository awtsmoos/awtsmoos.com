
// B"H

import { many } from "../ui/core/html.js";

/**
 * B"H
 * Gets active pane.
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
 * Syncs tab visual state.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
function syncTabs(pane) {
  for (const tab of many("[data-tab]")) {
    const yes = tab.dataset.tab === pane;
    tab.classList.toggle("active", yes);
    tab.setAttribute("aria-selected", yes ? "true" : "false");
  }
}

/**
 * B"H
 * Activates a single workspace pane.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
export function activatePane(pane) {
  let found = false;

  for (const node of many("[data-pane]")) {
    const yes = node.dataset.pane === pane;
    node.classList.toggle("active", yes);
    if (yes) found = true;
  }

  syncTabs(pane);

  if (!found) {
    const tab = many("[data-tab]").find(t => t.dataset.tab === pane);
    tab?.click();
  }

  document.dispatchEvent(new CustomEvent("awt:pane-change", {
    detail: { pane }
  }));
}
