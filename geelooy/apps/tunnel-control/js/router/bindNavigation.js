
// B"H

import { activatePane } from "./paneRouter.js";
import { paneFromButton } from "./buttonAliases.js";

/**
 * B"H
 * Binds dashboard, sidebar, and top hero buttons to panes.
 *
 * @returns {void}
 */
export function bindNavigationButtons() {
  document.addEventListener("click", event => {
    const button = event.target.closest("button, a");
    if (!button) return;

    if (button.id === "awtRefreshView") return;

    const pane = paneFromButton(button);
    if (!pane) return;

    const hasPane = !!document.querySelector(`[data-pane="${CSS.escape(pane)}"]`);
    if (!hasPane) return;

    event.preventDefault();
    activatePane(pane);
  }, true);
}

/**
 * B"H
 * Gives old buttons useful data attributes for CSS and debugging.
 *
 * @returns {void}
 */
export function markNavigationButtons() {
  for (const button of document.querySelectorAll("button, a")) {
    const pane = paneFromButton(button);
    if (!pane) continue;

    if (document.querySelector(`[data-pane="${CSS.escape(pane)}"]`)) {
      button.dataset.awtNavigate = pane;
    }
  }
}
