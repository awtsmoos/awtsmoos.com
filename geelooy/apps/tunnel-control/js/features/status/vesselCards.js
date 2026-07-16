// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";
import {
	collectVessels,
	labelForVessel,
	VIRTUAL_OS_TUNNEL
} from "../vessels/selector.js";
import {
	accessBadge,
	miniCard
} from "./cardPrimitives.js";
import {
	createModeCards,
	createModeLinks
} from "../modes/modeCards.js";

/**
 * @file Renders verified vessel counts, selection, and safe tabular identity.
 * @description
 * The Awtsmoos renews many vessels without revealing their inward filesystem.
 * Awtsmoos.com shows type, access, proof, and connection only; roots, write flags,
 * tools, limits, command policy, and capability profiles never enter these cards.
 */
export function vesselFamiliesCard(discovery = {}) {
	const native = discovery.nativeDevices || [];
	const browser = discovery.browserDevices || [];
	const virtual = discovery.virtualDevice || null;
	return miniCard(
		native.length || browser.length ? "success" : "warning",
		"Verified vessel map",
		[
			`Native tunnels: ${native.length}`,
			`Browser sessions: ${browser.length}`,
			`Virtual OS: ${virtual ? "available" : "unavailable"}`,
			`Recommended: ${discovery.recommended?.tunnelName || "none"}`
		]
	);
}

export function selectedVesselCard(vessel) {
	if (!vessel) {
		return miniCard("warning", "Target vessel", [
			"No verified target is currently selectable."
		]);
	}
	return miniCard(
		"success",
		"Target vessel",
		[
			labelForVessel(vessel),
			`Actions route to: ${vessel.tunnelName}`,
			`State: ${vessel.connected === false ? "offline" : "available"}`
		],
		{ badges: [accessBadge(vessel)] }
	);
}

export function vesselTableCard(discovery = {}, selectedName = "") {
	const vessels = collectVessels(discovery);
	if (!vessels.length) {
		return miniCard("warning", "Active vessels", [
			"No verified vessels discovered."
		]);
	}
	const table = h("table", {
		classes: ["awt-vessel-table"],
		children: [
			row(["Target", "Type", "Access", "Proof", "State"], "th"),
			...vessels.map((vessel) => row([
				vessel.tunnelName === selectedName
					? `✓ ${vessel.tunnelName}`
					: vessel.tunnelName,
				vessel.vesselType || vessel.kind || "vessel",
				vessel.access || "owned",
				vessel.ownershipVerified ? "verified" : "blocked",
				vessel.connected === false ? "offline" : "available"
			]))
		]
	});
	return h("article", {
		classes: ["mini-card", "is-success", "awt-vessel-table-card"],
		children: [
			h("header", {
				classes: ["mini-card__header"],
				children: [h("strong", { text: "Verified vessel table" })]
			}),
			h("div", {
				classes: ["awt-vessel-table-scroll"],
				children: [table]
			})
		]
	});
}

export function modeOverviewCard(discovery = {}) {
	return h("article", {
		classes: ["mini-card", "is-success", "awt-mode-overview"],
		children: [
			h("header", {
				classes: ["mini-card__header"],
				children: [h("strong", { text: "Three verified tunnel modes" })]
			}),
			createModeCards(discovery),
			createModeLinks()
		]
	});
}

function row(values, element = "td") {
	return h("tr", {
		children: values.map((value) => h(element, { text: value }))
	});
}

export { VIRTUAL_OS_TUNNEL };
