
// B"H

import { h } from "../ui/core/html.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { createSideRail } from "./sideRail.js";
import { createDashboard } from "../dashboard/dashboard.js";
import { createWorkspaceStage } from "./workspaceStage.js";
import { mountWorkspaceMode } from "./workspaceMode.js";
import { findAppRoot, collectPanes, markOldChromeArtifacts } from "./domCollect.js";

/**
 * B"H
 * Moves panes into the workspace stack.
 *
 * @param {HTMLElement[]} panes Pane nodes.
 * @param {HTMLElement} stack Stack node.
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
 * Builds a fallback if no panes are found.
 *
 * @returns {HTMLElement} Fallback pane.
 */
function fallbackPane() {
  return h("section", {
    attrs: { "data-pane": "diagnostic" },
    children: [
      h("div", {
        classes: ["awt-pane-heading"],
        children: [
          h("div", { classes: ["awt-pane-kicker"], text: "DIAGNOSTIC" }),
          h("h2", { text: "No panes found" }),
          h("p", { text: "The shell mounted, but no [data-pane] sections were found." })
        ]
      })
    ]
  });
}

/**
 * B"H
 * Mounts the no-scroll multi-page shell.
 *
 * @param {object} ctx Runtime context.
 * @returns {void}
 */
export function mountShell(ctx) {
  if (document.querySelector(".awt-control-shell")) return;

  document.body.classList.add("awt-pro-ready");

  const root = findAppRoot();
  const panes = collectPanes();
  const { stage, stack } = createWorkspaceStage();

  movePanes(panes.length ? panes : [fallbackPane()], stack);
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

  root.replaceChildren(shell);
  markOldChromeArtifacts();
  mountWorkspaceMode();

  document.dispatchEvent(new CustomEvent("awt:repair-ui"));
}
