
// B"H

import { debounce } from "../ui/core/events.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { collectDiagnostics } from "../diagnostics/collector.js";
import { maskVisibleSecrets } from "../security/secretMasker.js";
import { syncDashboardCards } from "../dashboard/activeCards.js";

/**
 * B"H
 * Repairs dynamic UI after async feature rendering.
 *
 * @returns {void}
 */
export function repairUi() {
  normalizePaneHeadings();
  collectDiagnostics();
  maskVisibleSecrets();
  syncDashboardCards();
}

/**
 * B"H
 * Mounts mutation-based repair.
 *
 * @returns {void}
 */
export function mountUiRepair() {
  const later = debounce(repairUi, 180);

  document.addEventListener("awt:repair-ui", repairUi);
  document.addEventListener("awt:pane-change", later);

  const observer = new MutationObserver(later);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  repairUi();
}
