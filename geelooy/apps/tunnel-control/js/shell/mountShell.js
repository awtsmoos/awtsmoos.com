
// B"H

import { h } from "../ui/core/html.js";
import { ensureActivePane } from "../router/paneRouter.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { createSideRail } from "./sideRail.js";
import { createDashboard } from "../dashboard/dashboard.js";
import { mountDashboardSync } from "../dashboard/activeCards.js";
import { findAppRoot, findTabRail } from "./findRoot.js";
import { mountWorkspaceMode } from "./workspaceMode.js";

/**
 * B"H
 * Splits original root nodes into panes and legacy leftovers.
 *
 * @param {Node[]} nodes Original child nodes.
 * @param {HTMLElement|null} tabRail Existing tab rail.
 * @returns {{panes: HTMLElement[], legacy: Node[]}} Split result.
 */
function splitNodes(nodes, tabRail) {
  const panes = [];
  const legacy = [];

  for (const node of nodes) {
    if (node === tabRail) continue;

    if (node.nodeType === Node.ELEMENT_NODE && node.matches?.("[data-pane]")) {
      panes.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE || node.textContent?.trim()) {
      legacy.push(node);
    }
  }

  return { panes, legacy };
}

/**
 * B"H
 * Builds the workspace stage.
 *
 * @returns {{stage: HTMLElement, stack: HTMLElement}} Stage and stack.
 */
function createWorkspaceStage() {
  const stack = h("div", { classes: ["awt-pane-stack"] });

  const stage = h("section", {
    classes: ["awt-workspace-stage"],
    children: [
      h("div", {
        classes: ["awt-workspace-toolbar"],
        children: [
          h("button", {
            attrs: { type: "button", id: "awtBackDashboard", "data-awt-home": "1" },
            text: "← Dashboard"
          }),
          h("div", {
            classes: ["awt-workspace-heading"],
            children: [
              h("div", { classes: ["awt-mini-kicker"], text: "Focused workspace" }),
              h("h2", { attrs: { id: "awtWorkspaceTitle" }, text: "Workspace" })
            ]
          })
        ]
      }),
      h("div", {
        classes: ["awt-workspace-body"],
        children: [stack]
      })
    ]
  });

  return { stage, stack };
}

/**
 * B"H
 * Mounts the professional shell around the existing app.
 *
 * The dashboard becomes the home screen. Panes move into a dedicated
 * workspace stage. Legacy leftovers are preserved in a hidden container
 * so existing scripts still have their nodes, but the user does not see
 * the old garbage vertical layout anymore.
 *
 * @param {object} ctx Runtime context.
 * @returns {void}
 */
export function mountShell(ctx) {
  if (document.querySelector(".awt-control-shell")) return;

  document.body.classList.add("awt-pro-ready");
  ensureActivePane();

  const root = findAppRoot();
  const tabRail = findTabRail();
  const originalChildren = Array.from(root.childNodes);
  const { panes, legacy } = splitNodes(originalChildren, tabRail);

  const side = createSideRail(tabRail, ctx);
  const dashboard = createDashboard(ctx);
  const { stage, stack } = createWorkspaceStage();
  const hiddenLegacy = h("div", { classes: ["awt-hidden-legacy"] });
  const main = h("div", { classes: ["awt-control-main"] });
  const shell = h("div", { classes: ["awt-control-shell"] });

  for (const pane of panes) stack.append(pane);
  for (const node of legacy) hiddenLegacy.append(node);

  main.append(dashboard, stage, hiddenLegacy);
  shell.append(side, main);

  root.textContent = "";
  root.append(shell);

  normalizePaneHeadings();
  mountDashboardSync();
  mountWorkspaceMode();

  document.getElementById("awtRefreshView")?.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("awt:repair-ui"));
  });
}
