
// B"H

import { h } from "../ui/core/html.js";
import { PANE_META } from "./paneMeta.js";

/**
 * B"H
 * Adds normalized headings to panes.
 *
 * @returns {void}
 */
export function normalizePaneHeadings() {
  for (const pane of document.querySelectorAll("[data-pane]")) {
    if (pane.querySelector(":scope > .awt-pane-heading")) continue;

    const key = pane.dataset.pane || "";
    const meta = PANE_META[key] || {
      kicker: key || "Panel",
      title: key || "Panel",
      desc: "Focused controls.",
      icon: "✦"
    };

    pane.prepend(h("div", {
      classes: ["awt-pane-heading"],
      children: [
        h("div", {
          classes: ["awt-pane-kicker"],
          text: `${meta.icon || "✦"} ${meta.kicker || key}`
        }),
        h("h2", { text: meta.title || key }),
        h("p", { text: meta.desc || "Focused controls." })
      ]
    }));
  }
}
