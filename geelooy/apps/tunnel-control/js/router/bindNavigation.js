
// B"H

import { activatePane } from "./paneRouter.js";
import { showDashboardHome } from "../shell/workspaceMode.js";

/**
 * B"H
 * Binds global navigation.
 *
 * @returns {void}
 */
export function bindNavigationButtons() {
  document.addEventListener("click", event => {
    const node = event.target.closest("[data-awt-navigate]");
    if (!node) return;

    event.preventDefault();
    activatePane(node.dataset.awtNavigate);
  });
}

/**
 * B"H
 * Kept for repair cycle compatibility.
 *
 * @returns {void}
 */
export function markNavigationButtons() {
  document.querySelectorAll("[data-awt-home]").forEach(node => {
    node.addEventListener("click", showDashboardHome, { once: true });
  });
}
