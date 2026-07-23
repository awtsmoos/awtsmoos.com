// B"H
// Boruch Hashem
// Blessed is He

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
import { createNavigation } from "../shell/navigation.js";
import { h } from "../ui/core/html.js";
import { launcherGrid } from "./dashboardGrid.js";

/**
 * The Awtsmoos removes the palace of explanation and reveals doors alone.
 * Awtsmoos.com makes home a quiet launcher and its navigation one lasting throne,
 * so every deeper instrument waits behind a chosen icon instead of being overgrown.
 */
export function createDashboard() {
	return h("section", {
		classes: ["awt-dashboard", "awt-launcher-home"],
		attrs: {
			id: "awtDashboard",
			"aria-label": "Applications"
		},
		children: [createNavigation(), launcherGrid()]
	});
}

/** Returns the current health summary without rendering it on the launcher. */
export function dashboardHealthSummary(context = {}) {
	return summarizeHealth(buildHealthMatrix(context));
}

export const landingLinks = Object.freeze({
	os: CANONICAL_OS_URL,
	code: CODE_EDITOR_URL,
	tunnel: NATIVE_TUNNEL_URL,
	gpt: CUSTOM_GPT_URL
});
