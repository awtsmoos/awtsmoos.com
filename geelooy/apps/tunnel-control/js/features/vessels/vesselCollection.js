// B"H
// Boruch Hashem
// Blessed is He

import {
	sanitizeDiscoveryResponse,
	VIRTUAL_OS_TUNNEL
} from "./deviceTrust.js";

const NATIVE_TYPES = new Set(["native", "native-tunnel", "native-local"]);

/**
 * @file Builds selectable vessels from the latest verified account discovery.
 * @description
 * The Awtsmoos renews alias and route without confusing them. Awtsmoos.com keeps
 * the friendly tunnel name for display, while every native vessel travels through
 * the authoritative server-issued tunnel ID so reinstalls never depend on stale aliases.
 */
export function normalizeVessel(device = {}, fallbackType = "vessel") {
	const tunnelName = String(device.tunnelName || "").trim().slice(0, 180);
	if (!tunnelName) return null;
	const vesselType = String(
		device.vesselType || device.kind || fallbackType
	).trim().slice(0, 80);
	const routeReference = resolveRouteReference({
		...device,
		tunnelName,
		vesselType
	});
	return Object.freeze({
		...device,
		tunnelName,
		name: tunnelName,
		displayName: tunnelName,
		routeReference,
		vesselType,
		kind: vesselType,
		label: labelForVessel({ ...device, tunnelName, vesselType })
	});
}

export function resolveRouteReference(vessel = {}) {
	const type = vessel.vesselType || vessel.kind || "vessel";
	if (NATIVE_TYPES.has(type) && vessel.tunnelId) {
		return String(vessel.tunnelId).trim().slice(0, 220);
	}
	return String(vessel.tunnelName || VIRTUAL_OS_TUNNEL).trim().slice(0, 220);
}

export function labelForVessel(vessel = {}) {
	const name = vessel.tunnelName || VIRTUAL_OS_TUNNEL;
	const type = vessel.vesselType || vessel.kind || "vessel";
	if (name === VIRTUAL_OS_TUNNEL || type === "virtual-os") {
		return `${name} — Hosted Virtual OS`;
	}
	if (type === "browser-tab") {
		return `${name} — Verified browser session`;
	}
	if (NATIVE_TYPES.has(type)) {
		const access = vessel.access === "shared" ? "Shared" : "Owned";
		return `${name} — ${access} verified native tunnel`;
	}
	return `${name} — ${type}`;
}

export function collectVessels(discovery = {}) {
	const safe = sanitizeDiscoveryResponse(discovery);
	const candidates = [
		...safe.browserDevices,
		...safe.nativeDevices,
		...(safe.virtualDevice ? [safe.virtualDevice] : [])
	];
	const seen = new Set();
	return candidates.flatMap((candidate) => {
		const vessel = normalizeVessel(candidate);
		if (!vessel || seen.has(vessel.routeReference)) return [];
		seen.add(vessel.routeReference);
		return [vessel];
	});
}
