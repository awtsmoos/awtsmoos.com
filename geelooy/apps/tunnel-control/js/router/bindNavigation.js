
// B"H

import { activatePane, showHome } from "./paneRouter.js";
import { closeNavigation } from "../shell/navigationControls.js";

/**
 * B"H
 * Binds data-awt-navigate controls.
 *
 * Run 09: navigation has exactly ONE owner — this delegated document
 * listener. The nav buttons used to ALSO carry their own click listeners
 * (shell/navigationControls.js), so every sidebar click activated its pane
 * twice (two awt:pane-change events per click, measured in the live-context
 * harness) and the two paths could diverge whenever a button node was
 * re-created or a mount ran twice. Delegation resolves the destination
 * from the event target at click time, so it survives node replacement;
 * the module guard below makes the binding itself one-time even if
 * mountAuthenticatedInteractions runs again.
 *
 * @returns {void}
 */
let navigationBound = false;

export function bindNavigationButtons() {
  if (navigationBound) return;
  navigationBound = true;
  document.addEventListener("click", event => {
    const node = event.target.closest("[data-awt-navigate], [data-awt-home]");
    if (!node) return;

    event.preventDefault();
    if (node.hasAttribute("data-awt-home")) showHome();
    else activatePane(node.dataset.awtNavigate);
    const navigation = node.closest(".awt-app-navigation");
    if (navigation) closeNavigation(navigation);
  });
}

/**
 * B"H
 * Compatibility hook for repair cycle.
 *
 * @returns {void}
 */
export function markNavigationButtons() {}
