
// B"H

import { h } from "../ui/core/html.js";
import { PANE_META, DASHBOARD_ORDER } from "../router/paneMeta.js";
import { activatePane, showHome } from "../router/paneRouter.js";

/**
 * B"H
 * Builds one side nav button.
 *
 * @param {string} key Pane key.
 * @returns {HTMLElement} Button.
 */
function navButton(key) {
  const meta = PANE_META[key] || { title: key, icon: "✦" };

  const button = h("button", {
    classes: ["awt-nav-button"],
    attrs: { type: "button", "data-tab": key },
    children: [
      h("span", { text: meta.icon || "✦" }),
      h("strong", { text: meta.title || key })
    ]
  });

  button.addEventListener("click", () => activatePane(key));
  return button;
}

/**
 * B"H
 * Creates the side navigation rail.
 *
 * @param {object} ctx Runtime context.
 * @param {string[]} availablePaneKeys Available panes.
 * @returns {HTMLElement} Side rail.
 */
export function createSideRail(ctx, availablePaneKeys = []) {
  const available = new Set(availablePaneKeys);

  const home = h("button", {
    classes: ["awt-home-button"],
    attrs: { type: "button" },
    text: "🏠 Dashboard"
  });

  home.addEventListener("click", showHome);

  return h("aside", {
    classes: ["awt-control-side"],
    children: [
      h("div", {
        classes: ["awt-brand-block"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "B\"H" }),
          h("h1", { text: "Tunnel Control" }),
          h("p", { text: ctx.getTunnelName() || "Connected tunnel" })
        ]
      }),
      home,
      h("nav", {
        classes: ["awt-side-tabs"],
        children: DASHBOARD_ORDER
          .filter(key => available.has(key))
          .map(navButton)
      })
    ]
  });
}
