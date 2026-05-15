
// B"H

import { h, one } from "../ui/core/html.js";

/**
 * B"H
 * Ensures diagnostics drawer exists.
 *
 * @returns {HTMLElement} Drawer.
 */
export function ensureDiagnosticsDrawer() {
  let drawer = one(".awt-diagnostics-drawer");
  if (drawer) return drawer;

  const close = h("button", {
    attrs: { type: "button" },
    text: "Close"
  });

  drawer = h("aside", {
    classes: ["awt-diagnostics-drawer"],
    children: [
      h("div", {
        classes: ["awt-diagnostics-head"],
        children: [h("h2", { text: "Diagnostics" }), close]
      }),
      h("div", { classes: ["awt-diagnostics-body"] })
    ]
  });

  const toggle = h("button", {
    classes: ["awt-diagnostics-toggle"],
    attrs: { type: "button" },
    text: "Diagnostics"
  });

  toggle.addEventListener("click", () => drawer.classList.toggle("is-open"));
  close.addEventListener("click", () => drawer.classList.remove("is-open"));

  document.body.append(toggle, drawer);
  return drawer;
}
