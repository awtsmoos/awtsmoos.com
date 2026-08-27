// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds diagnostic and routable vessels from sanitized account discovery.
 * @description
 * The Awtsmoos lets a friendly alias be seen while the immutable route carries
 * authority. Awtsmoos.com preserves every verified vessel for diagnosis, yet only
 * living ordinary-work vessels enter selection. A stale shadow may be remembered
 * by history, but it cannot become the road merely because its old name still rhymes.
 */

import {
	sanitizeDiscoveryResponse,
	VIRTUAL_OS_TUNNEL
} from "./deviceTrust.js";

const NATIVE_TYPES = new Set(["native", "native-tunnel", "native-local"]);

export function normalizeVessel(device = {}, fallbackType = "vessel") {
	const tunnelName = String(device.tunnelName || "").trim().slice(0, 180);
	if (!tunnelName) {
		return null;
	}
	const vesselType = String(
		device.vesselType || device.kind || fallbackType
	).trim().slice(0, 80);
	const routeReference = resolveRouteReference({ ...device, tunnelName, vesselType });
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
	const explicit = String(vessel.routeReference || "").trim();
	if (explicit) {
		return explicit.slice(0, 220);
	}
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
	if (["browser", "browser-tab", "browser-tunnel"].includes(type)) {
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
	return dedupe(candidates.map(candidate => normalizeVessel(candidate)));
}

export function collectRoutableVessels(discovery = {}) {
	return collectVessels(discovery).filter(isRoutableVessel);
}

export function isRoutableVessel(vessel = {}) {
	if (vessel.vesselType === "virtual-os" || vessel.tunnelName === VIRTUAL_OS_TUNNEL) {
		return vessel.isAlive !== false;
	}
	if (vessel.connected !== true || vessel.isAlive === false) {
		return false;
	}
	const health = vessel.health || {};
	if (health.probing === true || health.livenessState === "probing") {
		return false;
	}
	if (health.executionHealthSupported === true) {
		return health.executionHealthy === true && health.executionHealthFresh !== false;
	}
	return true;
}

function dedupe(vessels) {
	const seen = new Set();
	return vessels.flatMap(vessel => {
		if (!vessel || !vessel.routeReference || seen.has(vessel.routeReference)) {
			return [];
		}
		seen.add(vessel.routeReference);
		return [vessel];
	});
}
