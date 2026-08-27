// B"H

import { button, el, text } from "./dom.js";
import { findAction } from "./actions.js";

/**
 * B"H
 * Chapter 413: The Door Learned To Close.
 *
 * A palette that cannot close is not a door but a wall. This vessel now opens
 * by Ctrl/⌘K, closes by Escape, backdrop, close button, and every chosen action.
 */
export function mountBeautyCommandPalette() {
  if (document.getElementById("awtBeautyPalette")) return;
  const input = el("input", { classes: ["awt-beauty-input"], attrs: { placeholder: "Search everything…" } });
  const close = button("Close", ["awt-command-close"]);
  const results = el("div", { classes: ["awt-beauty-results"] });
  const root = el("section", {
    attrs: { id: "awtBeautyPalette", "aria-hidden": "true" },
    classes: ["awt-beauty-palette", "is-hidden"],
    children: [header(close), input, results]
  });

  document.body.append(root);
  const hide = () => setOpen(root, false);
  const show = () => { setOpen(root, true); input.focus(); };
  const render = () => results.replaceChildren(...findAction(input.value).slice(0, 10).map(actionButton(hide)));

  close.onclick = hide;
  input.oninput = render;
  root.addEventListener("click", event => { if (event.target === root) hide(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") hide();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      root.classList.contains("is-hidden") ? show() : hide();
    }
  });
  render();
}

function header(close) {
  return el("div", { classes: ["awt-command-head"], children: [text("h3", "Command Palette"), close] });
}

function setOpen(root, open) {
  root.classList.toggle("is-hidden", !open);
  root.setAttribute("aria-hidden", open ? "false" : "true");
}

function actionButton(hide) {
  return action => {
    const node = button(action.label, ["awt-command-item"]);
    node.append(text("small", action.hint || ""));
    node.onclick = () => { hide(); action.run(); };
    return node;
  };
}
