// B"H

import { button, el, text } from "./dom.js";
import { activateBeautyPane } from "./actions.js";

/**
 * B"H
 * Chapter 402: Suggestions Became Immediate Doors.
 */
export function mountSuggestions(root) {
  const wrap = el("section", { classes: ["awt-suggestions"], children: [text("h3", "Intelligent Suggestions")] });
  const actions = [
    ["No API key? Open vault", "apiKeys"],
    ["Need files? Open explorer", "explorer"],
    ["Need proof? Open diagnostics", "account"],
    ["Need focus? Toggle mission", null]
  ];
  for (const [label, pane] of actions) {
    const node = button(label, ["awt-suggestion"]);
    node.onclick = () => pane ? activateBeautyPane(pane) : document.dispatchEvent(new CustomEvent("awt:beauty-toggle-mission"));
    wrap.append(node);
  }
  root.append(wrap);
}
