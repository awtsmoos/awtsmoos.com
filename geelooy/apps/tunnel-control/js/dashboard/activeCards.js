
// B"H

import { getActivePane } from "../router/paneRouter.js";

/**
 * B"H
 * Syncs active dashboard card.
 *
 * @returns {void}
 */
export function syncDashboardCards() {
  const active = getActivePane();

  for (const card of document.querySelectorAll(".awt-action-card")) {
    card.classList.toggle("is-active", card.dataset.awtNavigate === active);
  }
}

/**
 * B"H
 * Mounts card syncing.
 *
 * @returns {void}
 */
export function mountDashboardSync() {
  document.addEventListener("awt:pane-change", syncDashboardCards);
  syncDashboardCards();
}
