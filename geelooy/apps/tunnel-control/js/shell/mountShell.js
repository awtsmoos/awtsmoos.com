
// B"H

import { h } from "../ui/core/html.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { createSideRail } from "./sideRail.js";
import { createDashboard } from "../dashboard/dashboard.js";
import { createWorkspaceStage } from "./workspaceStage.js";
import { mountWorkspaceMode } from "./workspaceMode.js";
import { findAppRoot, collectPanes, createFallbackPane } from "./domCollect.js";

/**
 * B"H
 * Collects pane keys from nodes.
 *
 * @param {HTMLElement[]} panes Pane nodes.
 * @returns {string[]} Pane keys.
 */
function paneKeys(panes) {
  return panes.map(pane => pane.dataset.pane).filter(Boolean);
}

/**
 * B"H
 * Moves panes into the stage stack.
 *
 * @param {HTMLElement[]} panes Pane nodes.
 * @param {HTMLElement} stack Stack.
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
 * Mounts the multi-page shell.
 *
 * @param {object} ctx Runtime context.
 * @returns {void}
 */
export function mountShell(ctx) {
  if (document.querySelector(".awt-control-shell")) return;

  const root = findAppRoot();
  const foundPanes = collectPanes();
  const panes = foundPanes.length ? foundPanes : [createFallbackPane()];
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
  root.replaceChildren(shell);

  mountWorkspaceMode();
  document.dispatchEvent(new CustomEvent("awt:repair-ui"));
}
