// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts sanitized tunnel vessels into health-aware presentation models.
 * @description
 * The Awtsmoos gives each vessel a face without changing its authority.
 * Awtsmoos.com keeps immutable route, health, capability, and cross-app handoff
 * centralized so Malchus renders truth instead of reconstructing policy in views.
 * The route remains the bond, while every button becomes only a doorway, never proof.
 */

import { vesselHealth } from "../vessels/vesselHealth.js";

export function vesselPresentation(device = {}) {
	const category = vesselCategory(device);
	const route = device.routeReference || device.tunnelId || device.tunnelName || "";
	const launches = launchTargets(category, device, route);
	return Object.freeze({
		category,
		label: categoryLabel(category),
		name: device.deviceName || device.tunnelName || "Tunnel vessel",
		displayName: device.tunnelName || "",
		route,
		status: vesselStatus(device),
		health: vesselHealth(device),
		capabilities: capabilityLabels(device.capabilities),
		canCommand: device.capabilities?.commandRun === true,
		canRead: device.capabilities?.fsRead === true,
		canWrite: device.capabilities?.fsWrite === true,
		launch: launches[0] || null,
		launches,
		shared: device.shared === true
	});
}

export function vesselCategory(device = {}) {
	const type = String(device.vesselType || device.kind || "").toLowerCase();
	if (type === "virtual-os") {
		return "virtual-os";
	}
	if (type === "native-tunnel" || type === "native") {
		return "native";
	}
	if (["browser-tab", "browser-tunnel", "browser"].includes(type)) {
		const hint = `${device.deviceName || ""} ${device.tunnelName || ""}`.toLowerCase();
		return hint.includes("code") ? "code-browser" : "browser";
	}
	return "unknown";
}

export function capabilityLabels(capabilities = {}) {
	const labels = [];
	if (capabilities.fsRead === true) {
		labels.push("Files read");
	}
	if (capabilities.fsWrite === true) {
		labels.push("Files write");
	}
	if (capabilities.commandRun === true) {
		labels.push("Commands");
	}
	if (capabilities.browserControl === true) {
		labels.push("Browser");
	}
	if (capabilities.runtime === true) {
		labels.push("Runtime");
	}
	return Object.freeze(labels);
}

function categoryLabel(category) {
	return {
		native: "Native machine",
		"code-browser": "Code browser tab",
		browser: "Browser peer",
		"virtual-os": "Virtual OS",
		unknown: "Tunnel vessel"
	}[category];
}

function vesselStatus(device) {
	if (device.connected !== true || device.isAlive === false) {
		return "Offline";
	}
	return device.shared === true ? "Connected · shared" : "Connected";
}

function launchTargets(category, device, route) {
	const launches = [];
	if (category === "code-browser") {
		launches.push(Object.freeze({ label: "Open Code", href: "/apps/code" }));
	}
	if (category === "virtual-os") {
		launches.push(Object.freeze({ label: "Open OS", href: "/os" }));
		return Object.freeze(launches);
	}
	if (route && device.capabilities?.fsRead === true) {
		launches.push(openInOs(route));
	}
	return Object.freeze(launches);
}

function openInOs(route) {
	const networkPath = `/network/${encodeURIComponent(route)}`;
	const query = new URLSearchParams({ openExplorer: networkPath });
	return Object.freeze({
		label: "Open in OS",
		href: `/os/?${query.toString()}`
	});
}
