// B"H

import { button, el, text } from "./dom.js";
import { findAction } from "./actions.js";

/**
 * B"H
 * Chapter 400: The Command Palette Became A Door Of Search.
 */
export function mountBeautyCommandPalette() {
  if (document.getElementById("awtBeautyPalette")) return;
  const input = el("input", { classes: ["awt-beauty-input"], attrs: { placeholder: "Search everything…" } });
  const results = el("div", { classes: ["awt-beauty-results"] });
  const root = el("section", { attrs: { id: "awtBeautyPalette", hidden: "" }, classes: ["awt-beauty-palette"], children: [text("h3", "Command Palette"), input, results] });
  document.body.append(root);
  const render = () => results.replaceChildren(...findAction(input.value).slice(0, 10).map(actionButton(root)));
  input.oninput = render;
  render();
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      root.hidden = !root.hidden;
      if (!root.hidden) input.focus();
    }
  });
}

function actionButton(root) {
  return action => {
    const node = button(action.label, ["awt-command-item"]);
    node.append(text("small", action.hint || ""));
    node.onclick = () => { action.run(); root.hidden = true; };
    return node;
  };
}
