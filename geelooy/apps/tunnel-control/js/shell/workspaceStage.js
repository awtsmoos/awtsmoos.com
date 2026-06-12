// B"H

import { h } from "../ui/core/html.js";
import { showHome } from "../router/paneRouter.js";

/**
 * B"H
 * Chapter 16: Every subpage received one calm doorway.
 *
 * The Awtsmoos keeps navigation clear: back, status, title, and body. Feature
 * panes can be dense inside, but the frame remains professional and predictable.
 *
 * @returns {{stage: HTMLElement, stack: HTMLElement}} Stage and pane stack.
 */
export function createWorkspaceStage() {
  const stack = h("div", { classes: ["awt-pane-stack"] });
  const back = h("button", { classes: ["awt-back-button"], attrs: { type: "button", id: "awtBackDashboard" }, text: "← Control Panel" });
  back.addEventListener("click", event => {
    event.preventDefault();
    showHome();
  });

  return {
    stack,
    stage: h("section", { classes: ["awt-workspace-stage"], attrs: { id: "awtWorkspace" }, children: [
      h("div", { classes: ["awt-workspace-toolbar"], children: [
        back,
        h("div", { classes: ["awt-workspace-title"], children: [
          h("div", { classes: ["awt-mini-kicker"], text: "FOCUSED SUBPAGE" }),
          h("h2", { attrs: { id: "awtWorkspaceTitle" }, text: "Workspace" })
        ] }),
        h("span", { classes: ["awt-workspace-status"], text: "Ready" })
      ] }),
      h("div", { classes: ["awt-workspace-body"], children: [stack] })
    ] })
  };
}
