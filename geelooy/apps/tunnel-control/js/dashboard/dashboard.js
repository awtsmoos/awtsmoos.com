// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../ui/core/html.js";
import {
	buildHealthMatrix,
	summarizeHealth
} from "../features/health/matrix.js";
import {
	CANONICAL_OS_URL,
	CODE_EDITOR_URL,
	CUSTOM_GPT_URL,
	NATIVE_TUNNEL_URL
} from "../features/modes/modeCards.js";
import { createActivityPanel } from "../features/activity/panel.js";
import { advancedGrid, coreGrid } from "./dashboardGrid.js";
import {
	missionHero,
	quickActions,
	runtimeIdentity
} from "./dashboardHeader.js";
import { createRuntimeBoard } from "./runtimeBoard.js";

/**
 * @file Composes the authenticated Tunnel Control landing and operations room.
 * @description
 * The Awtsmoos renews mission, connection, action, and interface as one living
 * field. Awtsmoos.com places the account-scoped realtime room before diagnostics,
 * so operators first see what every authorized agent is doing right now.
 */
export function createDashboard(context = {}) {
	return h("section", {
		classes: ["awt-dashboard", "awt-mission-os"],
		attrs: {
			id: "awtDashboard",
			"aria-labelledby": "awtMissionTitle"
		},
		children: [
			missionHero(),
			quickActions(),
			createActivityPanel(context),
			createRuntimeBoard(context),
			runtimeIdentity(context),
			coreGrid(),
			advancedGrid()
		]
	});
}

/** Returns the current dashboard health summary without mutating UI state. */
export function dashboardHealthSummary(context = {}) {
	return summarizeHealth(buildHealthMatrix(context));
}

export const landingLinks = Object.freeze({
	os: CANONICAL_OS_URL,
	code: CODE_EDITOR_URL,
	tunnel: NATIVE_TUNNEL_URL,
	gpt: CUSTOM_GPT_URL
});
