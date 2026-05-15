
// B"H

import { PANE_META } from "./paneMeta.js";

/**
 * B"H
 * Gets all live panes.
 *
 * @returns {HTMLElement[]} Pane nodes.
 */
export function panes() {
  return Array.from(document.querySelectorAll("[data-pane]"));
}

/**
 * B"H
 * Gets active pane key.
 *
 * @returns {string} Active pane key.
 */
export function getActivePane() {
  return panes().find(p => p.classList.contains("active"))?.dataset.pane || "";
}

/**
 * B"H
 * Activates one pane.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
export function activatePane(pane) {
  const all = panes();
  let found = false;

  for (const node of all) {
    const yes = node.dataset.pane === pane;
    node.classList.toggle("active", yes);
    if (yes) found = true;
  }

  for (const tab of document.querySelectorAll("[data-tab]")) {
    const yes = tab.dataset.tab === pane;
    tab.classList.toggle("active", yes);
    tab.setAttribute("aria-selected", yes ? "true" : "false");
  }

  if (found) {
    document.body.classList.remove("awt-home-mode");
    document.body.classList.add("awt-workspace-mode");
    document.dispatchEvent(new CustomEvent("awt:pane-change", {
      detail: { pane, meta: PANE_META[pane] || null }
    }));
  }
}

/**
 * B"H
 * Ensures some pane exists as a fallback.
 *
 * @returns {void}
 */
export function ensureActivePane() {
  if (getActivePane()) return;

  const setup = panes().find(p => p.dataset.pane === "setup");
  const first = setup || panes()[0];

  if (first) first.classList.add("active");
}
