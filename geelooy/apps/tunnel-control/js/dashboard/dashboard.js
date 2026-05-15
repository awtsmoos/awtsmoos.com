
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
 * Creates dashboard cards from the pane keys collected before shell mount.
 *
 * @param {string[]} availablePaneKeys Available pane keys.
 * @returns {HTMLElement[]} Card nodes.
 */
function dashboardCards(availablePaneKeys) {
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
 * @returns {HTMLElement} Dashboard.
 */
export function createDashboard(ctx, availablePaneKeys = []) {
  const cards = dashboardCards(availablePaneKeys);

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
            text: "Choose one mission. The app opens that workspace as a separate page instead of dumping every control into one giant scroll."
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
        children: cards.length ? cards : [
          h("div", {
            classes: ["awt-empty-dashboard"],
            children: [
              h("strong", { text: "No dashboard pages found" }),
              h("span", { text: "No [data-pane] sections were detected before shell mount." })
            ]
          })
        ]
      })
    ]
  });
}
