
// B"H

import { h } from "../ui/core/html.js";

/**
 * B"H
 * Creates workspace stage.
 *
 * @returns {{stage: HTMLElement, stack: HTMLElement}} Stage and stack.
 */
export function createWorkspaceStage() {
  const stack = h("div", { classes: ["awt-pane-stack"] });

  const stage = h("section", {
    classes: ["awt-workspace-stage"],
    attrs: { id: "awtWorkspace" },
    children: [
      h("div", {
        classes: ["awt-workspace-toolbar"],
        children: [
          h("button", {
            attrs: { type: "button", id: "awtBackDashboard" },
            text: "← Dashboard"
          }),
          h("div", {
            classes: ["awt-workspace-title"],
            children: [
              h("div", { classes: ["awt-mini-kicker"], text: "WORKSPACE" }),
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
