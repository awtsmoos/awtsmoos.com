
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
 * Creates dashboard cards.
 *
 * @returns {HTMLElement[]} Cards.
 */
function dashboardCards() {
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
  const cards = dashboardCards();

  return h("section", {
    classes: ["awt-dashboard"],
    attrs: { id: "awtDashboard" },
    children: [
      h("div", {
        classes: ["awt-dashboard-copy"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "B\"H CONTROL CENTER" }),
          h("h2", { text: "Awtsmoos Tunnel" }),
          h("p", {
            text: "Choose one mission. Each button opens a focused page with the real controls moved into place."
          }),
          h("div", {
            classes: ["awt-dashboard-metrics"],
            children: [
              metric("Tunnel", ctx.getTunnelName() || "connected"),
              metric("Root", ctx.getProjectPath() || "."),
              metric("Pages", String(cards.length))
            ]
          })
        ]
      }),
      h("div", {
        classes: ["awt-dashboard-grid"],
        children: cards
      })
    ]
  });
}
