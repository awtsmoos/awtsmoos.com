// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";
import { metric } from "./dashboardSections.js";
import { createPagedCardGrid } from "./dashboardPager.js";

/**
 * B"H
 * Chapter 10: The palace stopped scrolling and became a control room.
 *
 * The Awtsmoos reveals every workspace through one clean grid of gates. Nothing
 * heavy renders on the home page; each card opens its own subpage only when the
 * user chooses it.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Dashboard.
 */
export function createDashboard(ctx) {
  return h("section", {
    classes: ["awt-dashboard"],
    attrs: { id: "awtDashboard" },
    children: [
      h("header", { classes: ["awt-dashboard-head"], children: intro(ctx) }),
      createPagedCardGrid(cards()),
      h("p", { classes: ["awt-dashboard-note"], text: "Open a tile to enter its focused control page. The dashboard stays grid-first and low-scroll." })
    ]
  });
}

/**
 * B"H
 * Creates the compact professional dashboard header.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement[]} Header nodes.
 */
function intro(ctx) {
  return [
    h("div", { classes: ["awt-mini-kicker"], text: "B\"H AWTSMOOS TUNNEL CONTROL" }),
    h("h2", { text: "Control Panel" }),
    h("p", { text: "Choose a workspace. Details, forms, logs, and JSON stay inside their own pages." }),
    h("div", { classes: ["awt-dashboard-metrics"], children: metrics(ctx) })
  ];
}

/**
 * B"H
 * Builds compact live facts without stretching the page.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement[]} Metric nodes.
 */
function metrics(ctx) {
  return [
    metric("Runtime", ctx.runtime?.id || "active"),
    metric("Tunnel", ctx.runtime?.tunnel?.name || ctx.getTunnelName() || "transport"),
    metric("Root", ctx.runtime?.activeRoot || ctx.getProjectPath() || "."),
    metric("Sections", String(cards().length))
  ];
}

/**
 * B"H
 * Builds existing action/workspace cards.
 *
 * @returns {HTMLButtonElement[]} Cards.
 */
function cards() {
  return DASHBOARD_ORDER.map(key => createDashboardCard(key, PANE_META[key]));
}
