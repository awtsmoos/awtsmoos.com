
// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";
import { runtimeCatalog } from "../runtime/runtimeCatalog.js";

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
  const runtimes = runtimeCatalog(ctx.runtime || {});

  return h("section", {
    classes: ["awt-dashboard"],
    attrs: { id: "awtDashboard" },
    children: [
      h("div", {
        classes: ["awt-dashboard-copy"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "B\"H CONTROL CENTER" }),
          h("h2", { text: "Active Workspace Runtime" }),
          h("p", {
            text: "The workspace is the universe; the tunnel is only transport. Choose a mounted capability inside this runtime."
          }),
          h("div", {
            classes: ["awt-dashboard-metrics"],
            children: [
              metric("Runtime", ctx.runtime?.id || "unmounted"),
              metric("Tunnel", ctx.runtime?.tunnel?.name || ctx.getTunnelName() || "transport"),
              metric("Root", ctx.runtime?.activeRoot || ctx.getProjectPath() || "."),
              metric("Mode", ctx.runtime?.mode || "local-agent")
            ]
          })
        ]
      }),
      h("div", {
        classes: ["awt-runtime-grid"],
        children: runtimes.map(runtimeCard)
      }),
      h("div", {
        classes: ["awt-runtime-grid"],
        children: runtimes.map(runtimeCard)
      }),
      h("div", {
        classes: ["awt-dashboard-grid"],
        children: cards
      })
    ]
  });
}
