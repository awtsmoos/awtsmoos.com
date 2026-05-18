
// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";

/**
 * B"H
 * Builds a metric block.
 *
 * @param {string} label Label.
 * @param {string} value Value.
 * @returns {HTMLElement} Metric.
 */
function metric(label, value) {
  return h("div", {
    classes: ["awt-metric"],
    children: [
      h("span", { text: label }),
      h("strong", { text: value })
    ]
  });
}

/**
 * B"H
 * Chapter 2: One Grid, One Breath, Many Gates.
 *
 * The Awtsmoos does not need two kingdoms fighting for the same dashboard.
 * Every feature is already named in PAGE_SPECS; this function turns that one
 * registry into one living grid, where setup, keys, explorer, command, chrome,
 * docs, usage, account, and install all stand without conflict.
 *
 * @returns {HTMLElement[]} Feature navigation cards.
 */
function featureGridCards() {
  return DASHBOARD_ORDER.map(key => createDashboardCard(key, PANE_META[key]));
}

/**
 * B"H
 * Creates the dashboard home screen.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Dashboard.
 */
export function createDashboard(ctx) {
  const cards = featureGridCards();

  return h("section", {
    classes: ["awt-dashboard"],
    attrs: { id: "awtDashboard" },
    children: [
      h("div", {
        classes: ["awt-dashboard-copy"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "B\"H CONTROL CENTER" }),
          h("h2", { text: "Tunnel Control Dashboard" }),
          h("p", {
            text: "One dashboard grid exposes every mounted capability. Runtime is context; features are the doors."
          }),
          h("div", {
            classes: ["awt-dashboard-metrics"],
            children: [
              metric("Runtime", ctx.runtime?.id || "active"),
              metric("Tunnel", ctx.runtime?.tunnel?.name || ctx.getTunnelName() || "transport"),
              metric("Root", ctx.runtime?.activeRoot || ctx.getProjectPath() || "."),
              metric("Features", String(cards.length))
            ]
          })
        ]
      }),
      h("div", {
        classes: ["awt-dashboard-grid", "awt-feature-dashboard-grid"],
        children: cards
      })
    ]
  });
}
