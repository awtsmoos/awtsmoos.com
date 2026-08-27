
// B"H

import { debounce } from "../ui/core/events.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { collectDiagnostics } from "../diagnostics/collector.js";
import { maskVisibleSecrets } from "../security/secretMasker.js";
import { syncDashboardCards } from "../dashboard/activeCards.js";
import { markNavigationButtons } from "../router/bindNavigation.js";
import { cleanStaleNoTunnelPanels, fixCompressedStatusText } from "./cleanStalePanels.js";

/**
 * B"H
 * Repairs dynamic UI after async feature rendering.
 *
 * @param {string} tunnelName Active tunnel name.
 * @returns {void}
 */
export function repairUi(tunnelName = "") {
  normalizePaneHeadings();
  collectDiagnostics();
  maskVisibleSecrets();
  syncDashboardCards();
  markNavigationButtons();
  cleanStaleNoTunnelPanels(tunnelName);
  fixCompressedStatusText();
}

/**
 * B"H
 * Mounts mutation-based repair.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
export function mountUiRepair(getTunnelName = () => "") {
  const later = debounce(() => repairUi(getTunnelName()), 180);

  document.addEventListener("awt:repair-ui", () => repairUi(getTunnelName()));
  document.addEventListener("awt:pane-change", later);

  const observer = new MutationObserver(later);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  repairUi(getTunnelName());
}
