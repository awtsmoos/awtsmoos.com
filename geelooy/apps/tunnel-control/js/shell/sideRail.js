
// B"H

import { h } from "../ui/core/html.js";
import { PANE_META, DASHBOARD_ORDER } from "../router/paneMeta.js";
import { activatePane } from "../router/paneRouter.js";
import { showDashboardHome } from "./workspaceMode.js";

/**
 * B"H
 * Builds one nav button.
 *
 * @param {string} key Pane key.
 * @returns {HTMLButtonElement} Button.
 */
function navButton(key) {
  const meta = PANE_META[key] || { icon: "✦", title: key };

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
 * Creates the side rail.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Side rail.
 */
export function createSideRail(ctx) {
  const existing = new Set(
    Array.from(document.querySelectorAll("[data-pane]"))
      .map(pane => pane.dataset.pane)
  );

  const nav = h("nav", {
    classes: ["awt-side-tabs"],
    children: DASHBOARD_ORDER
      .filter(key => existing.has(key))
      .map(navButton)
  });

  const home = h("button", {
    classes: ["awt-home-button"],
    attrs: { type: "button" },
    text: "🏠 Dashboard"
  });

  home.addEventListener("click", showDashboardHome);

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
      nav
    ]
  });
}
