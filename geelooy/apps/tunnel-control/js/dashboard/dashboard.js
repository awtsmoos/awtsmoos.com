
// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_CARDS } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";

/**
 * B"H
 * Builds the home dashboard.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Dashboard.
 */
export function createDashboard(ctx) {
  return h("section", {
    classes: ["awt-dashboard"],
    children: [
      h("div", {
        classes: ["awt-dashboard-hero"],
        children: [
          h("div", {
            classes: ["awt-dashboard-copy"],
            children: [
              h("div", { classes: ["awt-mini-kicker"], text: "One clean URL" }),
              h("h2", { text: "Command center" }),
              h("p", {
                text:
                  "Start on the dashboard, choose one mission, then slide into a focused workspace. No more giant vertical debug scroll."
              }),
              h("div", {
                classes: ["awt-dashboard-metrics"],
                children: [
                  metric("Tunnel", ctx.getTunnelName() || "waiting"),
                  metric("Root", ctx.getProjectPath() || "."),
                  metric("Mode", "Focused workspace")
                ]
              }),
              h("div", {
                classes: ["awt-dashboard-actions"],
                children: [
                  h("button", {
                    attrs: {
                      type: "button",
                      "data-awt-navigate": "install"
                    },
                    text: "Install / Restart"
                  }),
                  h("button", {
                    attrs: {
                      type: "button",
                      "data-awt-navigate": "docs"
                    },
                    text: "API Docs"
                  }),
                  h("button", {
                    attrs: { type: "button", id: "awtRefreshView" },
                    text: "Refresh view"
                  })
                ]
              })
            ]
          }),
          h("div", {
            classes: ["awt-dashboard-grid"],
            children: DASHBOARD_CARDS.map(createDashboardCard)
          })
        ]
      })
    ]
  });
}

/**
 * B"H
 * Builds one small metric block.
 *
 * @param {string} label Metric label.
 * @param {string} value Metric value.
 * @returns {HTMLElement} Metric element.
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
