
// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";

/**
 * B"H
 * Builds a metric.
 *
 * @param {string} label Metric label.
 * @param {string} value Metric value.
 * @returns {HTMLElement} Metric node.
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
 * Builds dashboard cards from the panes actually collected.
 *
 * @param {string[]} availablePaneKeys Available panes.
 * @returns {HTMLElement[]} Cards.
 */
function cards(availablePaneKeys) {
  const available = new Set(availablePaneKeys);

  return DASHBOARD_ORDER
    .filter(key => available.has(key))
    .map(key => createDashboardCard(key, PANE_META[key]));
}

/**
 * B"H
 * Creates the dashboard home screen.
 *
 * @param {object} ctx Runtime context.
 * @param {string[]} availablePaneKeys Available pane keys.
 * @returns {HTMLElement} Dashboard node.
 */
export function createDashboard(ctx, availablePaneKeys = []) {
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
            text: "Choose one mission. The page opens that workspace instead of dumping every control into one giant scroll."
          }),
          h("div", {
            classes: ["awt-dashboard-metrics"],
            children: [
              metric("Tunnel", ctx.getTunnelName() || "connected"),
              metric("Root", ctx.getProjectPath() || "."),
              metric("Layout", "dashboard")
            ]
          })
        ]
      }),
      h("div", {
        classes: ["awt-dashboard-grid"],
        children: cards(availablePaneKeys)
      })
    ]
  });
}
