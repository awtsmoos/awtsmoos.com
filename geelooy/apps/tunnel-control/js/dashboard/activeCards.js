
// B"H

import { many } from "../ui/core/html.js";
import { getActivePane } from "../router/paneRouter.js";

/**
 * B"H
 * Syncs dashboard card active state.
 *
 * @returns {void}
 */
export function syncDashboardCards() {
  const active = getActivePane();

  for (const card of many(".awt-action-card")) {
    card.classList.toggle("is-active", card.dataset.targetTab === active);
  }
}

/**
 * B"H
 * Mounts dashboard active syncing.
 *
 * @returns {void}
 */
export function mountDashboardSync() {
  document.addEventListener("awt:pane-change", syncDashboardCards);
  document.addEventListener("click", event => {
    if (event.target.closest("[data-tab]")) {
      setTimeout(syncDashboardCards, 0);
    }
  });

  syncDashboardCards();
}
