// B"H

import { PAGE_GROUPS, PAGE_SPECS } from "../shell/pageSpecs.js";
import { button, el, text } from "./dom.js";
import { activateBeautyPane } from "./actions.js";

/**
 * B"H
 * Chapter 405: Control Map Became A Tree.
 */
export function mountControlMap(root) {
  const groups = Object.keys(PAGE_GROUPS).map(group => groupNode(group));
  root.append(el("section", { classes: ["awt-control-map2"], children: [text("h3", "Control Map 2.0"), ...groups] }));
}

function groupNode(group) {
  const pages = PAGE_SPECS.filter(page => page.group === group);
  const box = el("details", { classes: ["awt-map-group"], attrs: { open: "" }, children: [text("summary", PAGE_GROUPS[group])] });
  for (const page of pages) {
    const node = button(`↳ ${page.title}`, ["awt-map-node"]);
    node.onclick = () => activateBeautyPane(page.key);
    box.append(node);
  }
  return box;
}
