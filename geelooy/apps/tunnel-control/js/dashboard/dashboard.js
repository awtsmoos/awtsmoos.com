// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";
import { buildHealthMatrix, summarizeHealth } from "../features/health/matrix.js";
import { CANONICAL_OS_URL, CODE_EDITOR_URL, NATIVE_TUNNEL_URL, CUSTOM_GPT_URL } from "../features/modes/modeCards.js";

/**
 * B"H
 * Chapter 612: The scrolling bazaar collapsed into a command star.
 *
 * The Awtsmoos lets the opening surface become silence and choice: no rail,
 * no endless panels, only a fullscreen grid of rooms. Every card is a gate,
 * and every gate opens one dedicated page where the mission can breathe.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Mission Control OS home.
 */
export function createDashboard(ctx = {}) {
  return h("section", {
    classes: ["awt-dashboard", "awt-mission-os"],
    attrs: { id: "awtDashboard", "aria-labelledby": "awtMissionTitle" },
    children: [missionHero(), missionStatus(ctx), missionGrid()]
  });
}

/** @param {object} ctx Runtime context. @returns {object} Health summary. */
export function dashboardHealthSummary(ctx = {}) {
  return summarizeHealth(buildHealthMatrix(ctx));
}

function missionHero() {
  return h("header", {
    classes: ["awt-mission-hero"],
    children: [
      h("div", { classes: ["awt-mini-kicker"], text: "B\"H MISSION CONTROL OS" }),
      h("h2", { attrs: { id: "awtMissionTitle" }, text: "Choose a room. Command the mission." }),
      h("p", { text: "One control room. Three ways in. First time users start from a card, and veterans can Talk to Awtsmoos Shliach Agent after opening the focused docs page." })
    ]
  });
}

function missionStatus(ctx) {
  const summary = dashboardHealthSummary(ctx);
  const tunnel = ctx.runtime?.tunnel?.name || ctx.getTunnelName?.() || "No selected tunnel yet";

  return h("section", {
    classes: ["awt-mission-status"],
    attrs: { "aria-label": "Mission Control status" },
    children: [
      stat("Tunnel", tunnel),
      stat("Readiness", `${summary.ready}/${summary.total}`),
      stat("Mode", "Grid-first OS"),
      stat("Pages", DASHBOARD_ORDER.length)
    ]
  });
}

function missionGrid() {
  return h("div", {
    classes: ["awt-mission-grid"],
    attrs: { "aria-label": "Mission Control rooms" },
    children: DASHBOARD_ORDER.map(key => createDashboardCard(key, PANE_META[key]))
  });
}

function stat(label, value) {
  return h("article", {
    classes: ["awt-mission-stat"],
    children: [
      h("span", { text: label }),
      h("strong", { text: String(value || "—") })
    ]
  });
}

export const landingLinks = Object.freeze({
  os: CANONICAL_OS_URL,
  code: CODE_EDITOR_URL,
  tunnel: NATIVE_TUNNEL_URL,
  gpt: CUSTOM_GPT_URL
});
