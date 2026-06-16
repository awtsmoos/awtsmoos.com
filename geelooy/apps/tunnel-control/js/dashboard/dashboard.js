// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";
import { createPagedCardGrid } from "./dashboardPager.js";
import { createModeCards, createModeLinks, CANONICAL_OS_URL, CODE_EDITOR_URL, NATIVE_TUNNEL_URL, CUSTOM_GPT_URL } from "../features/modes/modeCards.js";
import { buildHealthMatrix, summarizeHealth } from "../features/health/matrix.js";

/**
 * B"H
 * Chapter 12: The first screen stopped shouting.
 *
 * Tunnel Control opens as a clean landing: one intense hero, three modes, easy
 * install/restart instructions, important links, then the main grid. Heavy live
 * streams, JSON, health details, and logs remain inside focused tiles.
 */
export function createDashboard(ctx = {}) {
  return h("section", {
    classes: ["awt-dashboard", "awt-landing"],
    attrs: { id: "awtDashboard" },
    children: [hero(ctx), createModeCards(ctx.device || {}), installPanel(), linksPanel(), createPagedCardGrid(cards())]
  });
}

export function dashboardHealthSummary(ctx = {}) {
  return summarizeHealth(buildHealthMatrix(ctx));
}

function hero(ctx) {
  const summary = dashboardHealthSummary(ctx);
  return h("header", { classes: ["awt-landing-hero"], children: [
    h("div", { classes: ["awt-hero-copy"], children: [
      h("div", { classes: ["awt-mini-kicker"], text: "B\"H AWTSMOOS TUNNEL CONTROL" }),
      h("h2", { text: "One control room. Three ways in." }),
      h("p", { text: "Choose native tunnel, browser-tab code vessel, or the one canonical Awtsmoos Virtual OS. The noisy consoles stay behind the grid until you open them." })
    ] }),
    h("div", { classes: ["awt-hero-status"], children: [
      h("strong", { text: `${summary.ready}/${summary.total}` }),
      h("span", { text: "readiness signals" }),
      h("small", { text: ctx.runtime?.tunnel?.name || ctx.getTunnelName?.() || "No selected tunnel yet" })
    ] })
  ] });
}

function installPanel() {
  return h("section", { classes: ["awt-install-strip"], children: [
    h("article", { children: [h("b", { text: "First time" }), h("p", { text: "Open the native tunnel app, install the agent, then refresh. It gives local files, commands, and Chrome." }), h("a", { attrs: { href: NATIVE_TUNNEL_URL, target: "_blank", rel: "noopener" }, text: "Install native tunnel" })] }),
    h("article", { children: [h("b", { text: "Already installed" }), h("p", { text: "Run the installer again. It refreshes the agent, reuses your saved tunnel name, and restarts cleanly." }), h("a", { attrs: { href: NATIVE_TUNNEL_URL, target: "_blank", rel: "noopener" }, text: "Restart / refresh" })] }),
    h("article", { children: [h("b", { text: "No install" }), h("p", { text: "Use the hosted OS or code tab vessel. They should be one Virtual OS identity across awtsmoos.com/os and app routes." }), h("a", { attrs: { href: CANONICAL_OS_URL, target: "_blank", rel: "noopener" }, text: "Open Awtsmoos OS" })] })
  ] });
}

function linksPanel() {
  return h("section", { classes: ["awt-landing-links"], children: [
    h("div", { children: [h("strong", { text: "Fast links" }), h("span", { text: "OS, code editor, tunnel installer, and the custom Shliach agent." })] }),
    createModeLinks(),
    h("a", { classes: ["awt-gpt-link"], attrs: { href: CUSTOM_GPT_URL, target: "_blank", rel: "noopener" }, text: "Talk to Awtsmoos Shliach Agent" })
  ] });
}

function cards() {
  return DASHBOARD_ORDER.map(key => createDashboardCard(key, PANE_META[key]));
}

export const landingLinks = Object.freeze({ os: CANONICAL_OS_URL, code: CODE_EDITOR_URL, tunnel: NATIVE_TUNNEL_URL, gpt: CUSTOM_GPT_URL });
