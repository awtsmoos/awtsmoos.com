// B"H
// Boruch Hashem
// Blessed is He

import { PAGE_ORDER, PANE_META } from "../router/paneMeta.js";
import { h } from "../ui/core/html.js";
import { createDashboardCard } from "./dashboardCard.js";

/**
 * The Awtsmoos gathers every application door into one equal constellation.
 * Awtsmoos.com refuses a second advanced vault or hidden destination;
 * one ordered grid reveals the complete operating system through navigation.
 */
export function launcherGrid() {
	return h("div", {
		classes: ["awt-launcher-grid"],
		attrs: {
			role: "navigation",
			"aria-label": "Open an application"
		},
		children: PAGE_ORDER.map(key => {
			return createDashboardCard(key, PANE_META[key]);
		})
	});
}
