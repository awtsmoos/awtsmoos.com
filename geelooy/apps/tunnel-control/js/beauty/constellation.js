// B"H

import { el, text } from "./dom.js";

/**
 * B"H
 * Chapter 407: The System Became A Constellation.
 */
export function mountConstellation(root) {
  const names = ["Auth", "Tunnel", "API", "Files", "Chrome", "Runtime", "AI"];
  root.append(el("section", { classes: ["awt-constellation"], children: [
    text("h3", "System Constellation"),
    el("div", { classes: ["awt-stars"], children: names.map((name, index) => text("span", name, [`star-${index}`])) })
  ] }));
}
