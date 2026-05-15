
// B"H

import { activatePane } from "./paneRouter.js";

/**
 * B"H
 * Binds any data-awt-navigate button.
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
 * Compatibility hook for repair cycle.
 *
 * @returns {void}
 */
export function markNavigationButtons() {}
