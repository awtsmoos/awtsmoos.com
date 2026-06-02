// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";
import { agentStrip, commandCenter, kabbalahMap, metric, providerGrid, section, taskList } from "./dashboardSections.js";

/**
 * B"H
 * Chapter 341: The Dashboard Became A Tree Of Fire.
 *
 * The Awtsmoos is hidden in every pixel as the vessel is drawn anew: metrics
 * below the title, sefirot as living coordinates, provider rivers, task sparks,
 * and a command center where one agent can awaken another without waiting.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Dashboard.
 */
export function createDashboard(ctx) {
  return h("section", {
    classes: ["awt-dashboard"],
    attrs: { id: "awtDashboard" },
    children: [
      h("div", { classes: ["awt-dashboard-copy"], children: intro(ctx) }),
      h("div", { classes: ["awt-dashboard-orbit"], children: orbit() }),
      h("div", { classes: ["awt-sacred-footer"], text: "מאין ליש • From Nothing • Everything" })
    ]
  });
}

function intro(ctx) {
  return [
    h("div", { classes: ["awt-mini-kicker"], text: "B\"H AWTSMOOS COMMAND CENTER" }),
    h("h2", { text: "Tunnel Control Dashboard" }),
    h("p", { text: "A secure local tunnel, AI delegates, provider keys, files, terminal, browser, and task councils in one revealed vessel." }),
    h("div", { classes: ["awt-dashboard-metrics"], children: metrics(ctx) }),
    section("Quick Actions", "local gates", h("div", { classes: ["awt-dashboard-grid", "awt-feature-dashboard-grid"], children: cards() }))
  ];
}

function orbit() {
  return [
    kabbalahMap(),
    section("AI Providers", "keys & rivers", providerGrid()),
    section("Active Tasks", "async sparks", taskList()),
    section("Recent Agents", "living delegates", agentStrip()),
    section("Awtsmoos AI Command Center", "spawn without blocking", commandCenter())
  ];
}

function metrics(ctx) {
  return [
    metric("Runtime", ctx.runtime?.id || "active"),
    metric("Tunnel", ctx.runtime?.tunnel?.name || ctx.getTunnelName() || "transport"),
    metric("Root", ctx.runtime?.activeRoot || ctx.getProjectPath() || "."),
    metric("Features", String(cards().length))
  ];
}

function cards() {
  return DASHBOARD_ORDER.map(key => createDashboardCard(key, PANE_META[key]));
}
