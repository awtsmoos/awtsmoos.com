// B"H

import { PAGE_SPECS } from "../shell/pageSpecs.js";
import { button, el, text } from "./dom.js";
import { activateBeautyPane } from "./actions.js";

/**
 * B"H
 * Chapter 401: Spotlight Became A Searchlight Across Panes.
 */
export function mountSpotlight(root) {
  const input = el("input", { classes: ["awt-spotlight-input"], attrs: { placeholder: "Spotlight panes, commands, docs…" } });
  const list = el("div", { classes: ["awt-spotlight-list"] });
  root.append(el("section", { classes: ["awt-spotlight"], children: [text("h3", "Workspace Spotlight"), input, list] }));
  const render = () => list.replaceChildren(...matches(input.value).map(paneButton));
  input.oninput = render;
  render();
}

function matches(query) {
  const q = String(query || "").toLowerCase();
  return PAGE_SPECS.filter(page => `${page.title} ${page.desc} ${page.group}`.toLowerCase().includes(q)).slice(0, 8);
}

function paneButton(page) {
  const node = button(page.title, ["awt-spotlight-row"]);
  node.append(text("small", page.desc || page.group));
  node.onclick = () => activateBeautyPane(page.key);
  return node;
}
