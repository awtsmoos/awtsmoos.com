// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds Tunnel Control vessel overview cards from sanitized models.
 * @description
 * The Awtsmoos reveals native, browser, and Virtual OS vessels without reopening
 * raw inventory. Awtsmoos.com preserves familiar session/recommendation landmarks
 * while richer detail cards reveal immutable route and capability truth beneath.
 */

import { h } from "../../ui/core/html.js";
import {
	collectVessels,
	VIRTUAL_OS_TUNNEL
} from "../vessels/selector.js";
import { miniCard } from "./cardPrimitives.js";
import { createModeCards, createModeLinks } from "../modes/modeCards.js";
import {
	cardShell,
	row,
	vesselDetailCard
} from "./vesselDetailCard.js";
import { vesselPresentation } from "./vesselPresentation.js";

export function vesselFamiliesCard(discovery = {}) {
	const native = discovery.nativeDevices || [];
	const browser = discovery.browserDevices || [];
	const recommended = discovery.recommended?.tunnelName ||
		discovery.tunnelName ||
		"none";
	return miniCard(
		native.length || browser.length ? "success" : "warning",
		"Verified vessel map",
		[
			`Native tunnels: ${native.length}`,
			`Browser sessions: ${browser.length}`,
			`Virtual OS: ${discovery.virtualDevice ? "available" : "unavailable"}`,
			`Recommended: ${recommended}`,
			`Immutable route: ${discovery.routeReference || "none"}`
		]
	);
}

export function selectedVesselCard(vessel) {
	if (!vessel) {
		return miniCard(
			"warning",
			"Target vessel",
			["No verified target is selectable."]
		);
	}
	return cardShell("Target vessel", [
		vesselDetailCard(vesselPresentation(vessel), true)
	]);
}

export function vesselTableCard(discovery = {}, selectedName = "") {
	const vessels = collectVessels(discovery);
	if (!vessels.length) {
		return miniCard("warning", "Active vessels", ["No verified vessels discovered."]);
	}
	const table = h("table", {
		classes: ["awt-vessel-table"],
		children: [
			row(["Target", "Kind", "Route", "State"], "th"),
			...vessels.map(vessel => tableRow(vessel, selectedName))
		]
	});
	return cardShell("Verified vessel table", [
		h("div", {
			classes: ["awt-vessel-table-scroll"],
			children: [table]
		})
	]);
}

export function vesselPeerCards(discovery = {}) {
	const vessels = [
		...(discovery.browserDevices || []),
		...(discovery.nativeDevices || []),
		...(discovery.virtualDevice ? [discovery.virtualDevice] : [])
	];
	if (!vessels.length) {
		return miniCard("warning", "Tunnel vessels", ["No verified vessels discovered."]);
	}
	return cardShell(
		"Tunnel vessels",
		vessels.map(vessel => {
			return vesselDetailCard(vesselPresentation(vessel), false);
		})
	);
}

export function modeOverviewCard(discovery = {}) {
	return cardShell("Three verified tunnel modes", [
		createModeCards(discovery),
		createModeLinks()
	]);
}

function tableRow(vessel, selectedName) {
	const model = vesselPresentation(vessel);
	return row([
		vessel.tunnelName === selectedName ? `✓ ${model.name}` : model.name,
		model.label,
		model.route,
		model.status
	]);
}

export { VIRTUAL_OS_TUNNEL };
