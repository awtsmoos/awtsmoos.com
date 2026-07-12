// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { createDashboardCard } from "./dashboardCard.js";

export function coreGrid() {
	return zone("Core command center", "Rooms, live actions, files, commands, providers, and tunnel permissions.", coreKeys(), "awt-core-grid");
}

export function advancedGrid() {
	return h("details", { classes: ["awt-dashboard-zone", "is-advanced-zone"], children: [
		h("summary", { text: "Advanced systems" }),
		grid(advancedKeys(), "awt-advanced-grid")
	] });
}

function zone(title, text, keys, className) {
	return h("section", { classes: ["awt-dashboard-zone", "is-core-zone"], children: [
		h("div", { classes: ["awt-zone-head"], children: [h("h3", { text: title }), h("p", { text })] }),
		grid(keys, className)
	] });
}

function grid(keys, className) {
	return h("div", {
		classes: ["awt-mission-grid", className],
		attrs: { "aria-label": className },
		children: keys.map(key => createDashboardCard(key, PANE_META[key]))
	});
}

function coreKeys() {
	return DASHBOARD_ORDER.filter(key => (PANE_META[key]?.badges || []).includes("core"));
}

function advancedKeys() {
	return DASHBOARD_ORDER.filter(key => !(PANE_META[key]?.badges || []).includes("core"));
}
