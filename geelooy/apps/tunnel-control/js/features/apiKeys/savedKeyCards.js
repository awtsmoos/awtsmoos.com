// B"H

import { h } from "../../ui/core/html.js";
import { maskKey } from "./keyDisplay.js";

/**
 * B"H
 * Chapter 371: Saved Keys Became Cards Of Text, Not Strings Of Fire.
 */
export function savedListNodes(saved, active, handlers) {
  if (!saved.length) {
    return [h("div", { classes: ["notice"], text: "No saved local keys yet. Create one or paste one above." })];
  }

  return saved.map(key => savedKeyCard(key, active, handlers));
}

function savedKeyCard(key, active, handlers) {
  const useButton = h("button", {
    classes: ["button", "small", "use-key"],
    attrs: { type: "button" },
    text: "Use"
  });

  const copyButton = h("button", {
    classes: ["button", "small", "copy-key"],
    attrs: { type: "button" },
    text: "Copy raw key"
  });

  useButton.onclick = () => handlers.useKey(key);
  copyButton.onclick = () => handlers.copyKey(key);

  return h("div", {
    classes: ["saved-key-card", key.apiKey === active ? "active" : ""],
    children: [
      h("h4", { text: key.name || "Saved API key" }),
      h("div", { classes: ["muted-line"], text: `User: ${key.userId || "local"}` }),
      h("div", { classes: ["muted-line"], text: `Scopes: ${(key.scopes || []).join(" ") || "unknown"}` }),
      h("code", { attrs: { title: "Masked saved key" }, text: maskKey(key.apiKey) }),
      h("div", { classes: ["saved-key-actions"], children: [useButton, copyButton] })
    ]
  });
}
