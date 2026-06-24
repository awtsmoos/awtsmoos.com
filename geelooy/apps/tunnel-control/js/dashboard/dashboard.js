// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";
import { buildHealthMatrix, summarizeHealth } from "../features/health/matrix.js";
import { CANONICAL_OS_URL, CODE_EDITOR_URL, NATIVE_TUNNEL_URL, CUSTOM_GPT_URL } from "../features/modes/modeCards.js";

/**
 * B"H
 * Chapter 907: The command center gained hierarchy.
 *
 * Core doors stand in the open. Advanced systems bow behind a details gate. No
 * extra sidebars, no app-inside-app maze, one scroll from mission to machinery.
 */
export function createDashboard(ctx = {}) {
  return h("section", { classes: ["awt-dashboard", "awt-mission-os"], attrs: { id: "awtDashboard", "aria-labelledby": "awtMissionTitle" }, children: [missionHero(), quickActions(), missionStatus(ctx), coreGrid(), advancedGrid()] });
}

export function dashboardHealthSummary(ctx = {}) { return summarizeHealth(buildHealthMatrix(ctx)); }

function missionHero() {
  return h("header", { classes: ["awt-mission-hero"], children: [
    h("div", { classes: ["awt-mini-kicker"], text: "B\"H COMMAND CENTER" }),
    h("h2", { attrs: { id: "awtMissionTitle" }, text: "Command the mission." }),
    h("p", { text: "Watch agents. Inspect files. Execute tools. Control the tunnel from one normal scrolling page." })
  ] });
}

function quickActions() {
  const keys = ["missionRooms", "live", "explorer", "usage", "setup"];
  return h("nav", { classes: ["awt-quick-actions"], attrs: { "aria-label": "Quick actions" }, children: keys.map(key => quickButton(key)) });
}

function quickButton(key) {
  const meta = PANE_META[key] || {};
  return h("button", { classes: ["awt-quick-action"], attrs: { type: "button", "data-awt-navigate": key }, text: meta.title || key });
}

function missionStatus(ctx) {
  const summary = dashboardHealthSummary(ctx);
  const tunnel = ctx.runtime?.tunnel?.name || ctx.getTunnelName?.() || "No selected tunnel yet";
  return h("section", { classes: ["awt-mission-status"], attrs: { "aria-label": "Command center status" }, children: [stat("Tunnel", tunnel), stat("Ready", `${summary.ready}/${summary.total}`), stat("Core", coreKeys().length), stat("Advanced", advancedKeys().length)] });
}

function coreGrid() {
  return h("section", { classes: ["awt-dashboard-zone", "is-core-zone"], children: [zoneHead("Core command center", "Rooms, live commands, files, tools, root, and agent oversight."), grid(coreKeys(), "awt-core-grid")] });
}

function advancedGrid() {
  return h("details", { classes: ["awt-dashboard-zone", "is-advanced-zone"], children: [h("summary", { text: "Advanced systems" }), grid(advancedKeys(), "awt-advanced-grid")] });
}

function zoneHead(title, text) {
  return h("div", { classes: ["awt-zone-head"], children: [h("h3", { text: title }), h("p", { text })] });
}

function grid(keys, className) {
  return h("div", { classes: ["awt-mission-grid", className], attrs: { "aria-label": className }, children: keys.map(key => createDashboardCard(key, PANE_META[key])) });
}

function coreKeys() { return DASHBOARD_ORDER.filter(key => (PANE_META[key]?.badges || []).includes("core")); }
function advancedKeys() { return DASHBOARD_ORDER.filter(key => !(PANE_META[key]?.badges || []).includes("core")); }
function stat(label, value) { return h("article", { classes: ["awt-mission-stat"], children: [h("span", { text: label }), h("strong", { text: String(value || "—") })] }); }

export const landingLinks = Object.freeze({ os: CANONICAL_OS_URL, code: CODE_EDITOR_URL, tunnel: NATIVE_TUNNEL_URL, gpt: CUSTOM_GPT_URL });
