
// B"H

import { h } from "../ui/core/html.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { createSideRail } from "./sideRail.js";
import { createDashboard } from "../dashboard/dashboard.js";
import { createWorkspaceStage } from "./workspaceStage.js";
import { mountWorkspaceMode } from "./workspaceMode.js";
import { collectPanes, createFallbackPane } from "./domCollect.js";

/**
 * B"H
 * Returns clean pane keys.
 *
 * @param {HTMLElement[]} panes Pane elements.
 * @returns {string[]} Pane keys.
 */
function paneKeys(panes) {
  return panes
    .map(pane => pane.dataset.pane || "")
    .filter(Boolean);
}

/**
 * B"H
 * Moves panes into the workspace stack.
 *
 * @param {HTMLElement[]} panes Pane elements.
 * @param {HTMLElement} stack Destination stack.
 * @returns {void}
 */
function movePanes(panes, stack) {
  for (const pane of panes) {
    pane.classList.remove("active");
    stack.append(pane);
  }
}

/**
 * B"H
 * Removes old body content and mounts only the new app shell.
 *
 * @param {HTMLElement} shell Shell element.
 * @returns {void}
 */
function replaceWholeApp(shell) {
  const headSafe = document.createComment("B'H tunnel control shell mounted");
  document.body.replaceChildren(headSafe, shell);
}

/**
 * B"H
 * Mounts the actual multi-page dashboard shell.
 *
 * This intentionally collects panes from the entire current document
 * before replacing the old vertical page. The previous version only
 * looked at direct children, which produced an empty dashboard grid.
 *
 * @param {object} ctx Runtime context.
 * @returns {void}
 */
export function mountShell(ctx) {
  if (document.querySelector(".awt-control-shell")) return;

  const found = collectPanes();
  const panes = found.length ? found : [createFallbackPane()];
  const keys = paneKeys(panes);
  const { stage, stack } = createWorkspaceStage();

  movePanes(panes, stack);
  normalizePaneHeadings();

  const shell = h("div", {
    classes: ["awt-control-shell"],
    children: [
      createSideRail(ctx, keys),
      h("main", {
        classes: ["awt-control-main"],
        children: [
          createDashboard(ctx, keys),
          stage
        ]
      })
    ]
  });

  document.body.classList.add("awt-pro-ready");
  replaceWholeApp(shell);
  mountWorkspaceMode();

  document.dispatchEvent(new CustomEvent("awt:repair-ui"));
}
