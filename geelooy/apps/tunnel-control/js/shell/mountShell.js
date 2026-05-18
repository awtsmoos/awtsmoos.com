
// B"H

import { h } from "../ui/core/html.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { createSideRail } from "./sideRail.js";
import { createDashboard } from "../dashboard/dashboard.js";
import { createWorkspaceStage } from "./workspaceStage.js";
import { mountWorkspaceMode } from "./workspaceMode.js";
import { collectPanes } from "./domCollect.js";

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
 * Chapter 4: The Portals Must Survive the Palace Rebuild.
 *
 * Some feature vessels are not panes. The root picker, browser dialogs, and
 * future overlays live as portals. If body.replaceChildren() burns the old
 * staging root without first saving them, their event listeners and DOM vanish.
 *
 * @returns {HTMLElement[]} Portal nodes to keep beside the shell.
 */
function collectPortals() {
  return Array.from(document.querySelectorAll("#rootPickerModal, [data-awt-portal], .awt-portal"));
}

/**
 * B"H
 * Mounts the multi-page shell from real controls.
 *
 * @param {object} ctx Runtime context.
 * @returns {void}
 */
export function mountShell(ctx) {
  if (document.querySelector(".awt-control-shell")) return;

  const panes = collectPanes();
  const portals = collectPortals();
  const { stage, stack } = createWorkspaceStage();

  movePanes(panes, stack);
  normalizePaneHeadings();

  const shell = h("div", {
    classes: ["awt-control-shell"],
    children: [
      createSideRail(ctx),
      h("main", {
        classes: ["awt-control-main"],
        children: [
          createDashboard(ctx),
          stage
        ]
      })
    ]
  });

  document.body.classList.add("awt-pro-ready");
  document.body.replaceChildren(shell, ...portals);

  mountWorkspaceMode();
  document.dispatchEvent(new CustomEvent("awt:repair-ui"));
}
