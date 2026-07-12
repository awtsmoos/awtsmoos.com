// B"H

import { h } from "../ui/core/html.js";
import { buildHealthMatrix, summarizeHealth } from "../features/health/matrix.js";
import { CANONICAL_OS_URL, CODE_EDITOR_URL, NATIVE_TUNNEL_URL, CUSTOM_GPT_URL } from "../features/modes/modeCards.js";
import { advancedGrid, coreGrid } from "./dashboardGrid.js";
import { missionHero, quickActions, runtimeIdentity } from "./dashboardHeader.js";
import { createRuntimeBoard } from "./runtimeBoard.js";

/** B"H: A truthful agent-first landing surface backed by the live feature panes. */
export function createDashboard(ctx = {}) {
	return h("section", {
		classes: ["awt-dashboard", "awt-mission-os"],
		attrs: { id: "awtDashboard", "aria-labelledby": "awtMissionTitle" },
		children: [missionHero(), quickActions(), createRuntimeBoard(ctx), runtimeIdentity(ctx), coreGrid(), advancedGrid()]
	});
}

export function dashboardHealthSummary(ctx = {}) {
	return summarizeHealth(buildHealthMatrix(ctx));
}

export const landingLinks = Object.freeze({
	os: CANONICAL_OS_URL,
	code: CODE_EDITOR_URL,
	tunnel: NATIVE_TUNNEL_URL,
	gpt: CUSTOM_GPT_URL
});
