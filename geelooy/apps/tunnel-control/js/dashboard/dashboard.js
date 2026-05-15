
// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";

/**
 * B"H
 * Builds dashboard cards only for panes that exist.
 *
 * @returns {HTMLElement[]} Cards.
 */
function dashboardCards() {
  const existing = new Set(
    Array.from(document.querySelectorAll("[data-pane]"))
      .map(pane => pane.dataset.pane)
  );

  return DASHBOARD_ORDER
    .filter(key => existing.has(key))
    .map(key => createDashboardCard(key, PANE_META[key]));
}

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
 * Creates the home dashboard.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Dashboard.
 */
export function createDashboard(ctx) {
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
            text: "Choose one mission. The page slides into that workspace without the old giant vertical debug scroll."
          }),
          h("div", {
            classes: ["awt-dashboard-metrics"],
            children: [
              metric("Tunnel", ctx.getTunnelName() || "connected"),
              metric("Root", ctx.getProjectPath() || "."),
              metric("Layout", "multi-page")
            ]
          })
        ]
      }),
      h("div", {
        classes: ["awt-dashboard-grid"],
        children: dashboardCards()
      })
    ]
  });
}
