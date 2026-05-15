
// B"H
import { qsa } from "./dom.js";
import { state } from "./state.js";

export function switchPane(id) {
  state.pane = id;
  qsa(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === id));
  qsa(".pane").forEach(pane => pane.classList.toggle("active", pane.dataset.pane === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
