// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";
import { buildHealthMatrix, summarizeHealth } from "../features/health/matrix.js";
import { CANONICAL_OS_URL, CODE_EDITOR_URL, NATIVE_TUNNEL_URL, CUSTOM_GPT_URL } from "../features/modes/modeCards.js";

/**
 * B"H
 * Chapter 905: The home page became a command center, not a mall.
 *
 * Six front doors rise first: rooms, live, files, tools, root, obedience. The
 * rest remains reachable as advanced chambers, but the first breath is command.
 */
export function createDashboard(ctx = {}) {
  return h("section", { classes: ["awt-dashboard", "awt-mission-os"], attrs: { id: "awtDashboard", "aria-labelledby": "awtMissionTitle" }, children: [missionHero(), missionStatus(ctx), missionGrid()] });
}

export function dashboardHealthSummary(ctx = {}) { return summarizeHealth(buildHealthMatrix(ctx)); }

function missionHero() {
  return h("header", { classes: ["awt-mission-hero"], children: [
    h("div", { classes: ["awt-mini-kicker"], text: "B\"H COMMAND CENTER" }),
    h("h2", { attrs: { id: "awtMissionTitle" }, text: "Rooms. Tools. Files. Live commands." }),
    h("p", { text: "One scrollable control center. Start in Mission Rooms, watch live tool activity, inspect files, or open the Tool Codex. Advanced pages stay below without taking over the UI." })
  ] });
}

function missionStatus(ctx) {
  const summary = dashboardHealthSummary(ctx);
  const tunnel = ctx.runtime?.tunnel?.name || ctx.getTunnelName?.() || "No selected tunnel yet";
  return h("section", { classes: ["awt-mission-status"], attrs: { "aria-label": "Command center status" }, children: [stat("Tunnel", tunnel), stat("Ready", `${summary.ready}/${summary.total}`), stat("Front doors", "6 core"), stat("Mode", "normal scroll")] });
}

function missionGrid() {
  return h("div", { classes: ["awt-mission-grid"], attrs: { "aria-label": "Command center rooms" }, children: DASHBOARD_ORDER.map(key => createDashboardCard(key, PANE_META[key])) });
}

function stat(label, value) {
  return h("article", { classes: ["awt-mission-stat"], children: [h("span", { text: label }), h("strong", { text: String(value || "—") })] });
}

export const landingLinks = Object.freeze({ os: CANONICAL_OS_URL, code: CODE_EDITOR_URL, tunnel: NATIVE_TUNNEL_URL, gpt: CUSTOM_GPT_URL });
