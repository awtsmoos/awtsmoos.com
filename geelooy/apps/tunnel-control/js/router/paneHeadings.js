
// B"H

import { h, many, one } from "../ui/core/html.js";
import { PANE_META } from "./paneMeta.js";

/**
 * B"H
 * Adds clean non-clipped headings to every pane.
 *
 * @returns {void}
 */
export function normalizePaneHeadings() {
  for (const pane of many("[data-pane]")) {
    if (one(":scope > .awt-pane-heading", pane)) continue;

    const key = pane.dataset.pane || "panel";
    const meta = PANE_META[key] || [key, key, "Focused controls."];

    pane.prepend(h("div", {
      classes: ["awt-pane-heading"],
      children: [
        h("div", { classes: ["awt-mini-kicker"], text: meta[0] }),
        h("h2", { text: meta[1] }),
        h("p", { text: meta[2] })
      ]
    }));
  }
}
