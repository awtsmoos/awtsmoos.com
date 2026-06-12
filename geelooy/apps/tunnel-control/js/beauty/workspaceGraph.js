// B"H

import { el, text } from "./dom.js";

/**
 * B"H
 * Chapter 406: The Workspace Became A Graph Of Vessels.
 */
export function mountWorkspaceGraph(root) {
  const nodes = ["Tunnel", "Explorer", "Browser", "Runtime", "Commands", "AI"];
  root.append(el("section", { classes: ["awt-workspace-graph"], children: [
    text("h3", "Workspace Graph"),
    el("div", { classes: ["awt-graph-nodes"], children: nodes.map(name => text("span", name)) })
  ] }));
}
