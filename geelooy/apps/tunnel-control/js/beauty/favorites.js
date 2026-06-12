// B"H

import { PAGE_META } from "../router/paneMeta.js";
import { el, button, text } from "./dom.js";
import { loadBeautyState, toggleFavorite } from "./state.js";
import { activateBeautyPane } from "./actions.js";

/**
 * B"H
 * Chapter 398: Favorites Became Little Stars.
 */
export function mountFavorites(root) {
  const list = el("div", { classes: ["awt-favorites-list"] });
  const wrap = el("section", { classes: ["awt-favorites"], children: [text("h3", "Favorite Directories & Panes"), list] });
  root.append(wrap);
  const render = () => list.replaceChildren(...(loadBeautyState().favorites || []).map(favButton), addButton(render));
  render();
}

function favButton(key) {
  const meta = PAGE_META[key];
  const node = button(`★ ${meta?.title || key}`, ["awt-favorite-pill"]);
  node.onclick = () => activateBeautyPane(key);
  return node;
}

function addButton(render) {
  const node = button("＋ Star current", ["awt-favorite-pill", "is-add"]);
  node.onclick = () => {
    const pane = document.querySelector("[data-pane].active")?.dataset.pane || "explorer";
    toggleFavorite(pane);
    render();
  };
  return node;
}
