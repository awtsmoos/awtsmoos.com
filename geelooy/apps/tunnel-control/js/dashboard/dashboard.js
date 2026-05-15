
// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_CARDS } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";

/**
 * B"H
 * Builds the dashboard.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Dashboard.
 */
export function createDashboard(ctx) {
  return h("section", {
    classes: ["awt-dashboard"],
    children: [
      h("div", {
        classes: ["awt-dashboard-head"],
        children: [
          h("div", {
            children: [
              h("div", { classes: ["awt-mini-kicker"], text: "One clean URL" }),
              h("h2", { text: "Command center" }),
              h("p", {
                text: dashboardText(ctx)
              })
            ]
          }),
          h("button", {
            attrs: { type: "button", id: "awtRefreshView" },
            text: "Refresh view"
          })
        ]
      }),
      h("div", {
        classes: ["awt-dashboard-grid"],
        children: DASHBOARD_CARDS.map(createDashboardCard)
      })
    ]
  });
}

/**
 * B"H
 * Dashboard summary sentence.
 *
 * @param {object} ctx Runtime context.
 * @returns {string} Text.
 */
function dashboardText(ctx) {
  const tunnel = ctx.getTunnelName() || "active tunnel";
  const root = ctx.getProjectPath() || ".";
  return `Logged in panel resolved ${tunnel}. Current root: ${root}.`;
}
