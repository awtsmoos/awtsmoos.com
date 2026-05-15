
// B"H

import { h } from "../ui/core/html.js";
import { createStatusRail } from "./statusRail.js";

/**
 * B"H
 * Builds the calm left control rail.
 *
 * @param {HTMLElement|null} tabRail Existing tabs.
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Sidebar.
 */
export function createSideRail(tabRail, ctx) {
  const side = h("aside", {
    classes: ["awt-control-side"],
    children: [
      h("div", {
        classes: ["awt-brand-block"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "B\"H Awtsmoos" }),
          h("h1", { text: "Tunnel Control" }),
          h("p", {
            text: "A focused command center for files, terminal, Chrome, API keys, setup, and diagnostics."
          })
        ]
      }),
      createStatusRail(ctx)
    ]
  });

  if (tabRail) {
    tabRail.classList.add("awt-side-tabs");
    side.append(tabRail);
  }

  return side;
}
