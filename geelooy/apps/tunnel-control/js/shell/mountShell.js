// B"H

import { h } from "../ui/core/html.js";
import { normalizePaneHeadings } from "../router/paneHeadings.js";
import { createDashboard } from "../dashboard/dashboard.js";
import { createWorkspaceStage } from "./workspaceStage.js";
import { mountWorkspaceMode } from "./workspaceMode.js";
import { collectPanes } from "./domCollect.js";

/**
 * B"H
 * Chapter 801: The side rail dissolved into the central command firmament.
 *
 * Tunnel Control is not a sideways list anymore. The Awtsmoos opens one clean
 * control surface: grid first, focused page second, no side tabs of any kind.
 */
function movePanes(panes, stack) {
  for (const pane of panes) {
    pane.classList.remove("active");
    stack.append(pane);
  }
}

/**
 * B"H
 * Preserves modal/portal vessels while the shell is reborn.
 */
function collectPortals() {
  return Array.from(document.querySelectorAll("#rootPickerModal, [data-awt-portal], .awt-portal"));
}

/**
 * B"H
 * Mounts a rail-free multi-page Mission Control OS.
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
    classes: ["awt-control-shell", "awt-no-side-rail-shell"],
    children: [
      h("main", {
        classes: ["awt-control-main"],
        children: [createDashboard(ctx), stage]
      })
    ]
  });

  document.body.classList.add("awt-pro-ready", "awt-no-side-rails");
  document.body.replaceChildren(shell, ...portals);

  mountWorkspaceMode();
  document.dispatchEvent(new CustomEvent("awt:repair-ui"));
}
