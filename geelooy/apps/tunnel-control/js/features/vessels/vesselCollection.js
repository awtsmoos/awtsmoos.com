// B"H
// Boruch Hashem
// Blessed is He

import {
	sanitizeDiscoveryResponse,
	VIRTUAL_OS_TUNNEL
} from "./deviceTrust.js";

/**
 * @file Builds selectable vessels only from the sanitized account discovery model.
 * @description
 * The Awtsmoos renews device and choice without letting a stale recommendation
 * become authority. Awtsmoos.com ignores raw `device`, `tunnel`, and `recommended`
 * payloads; only verified arrays and the fixed Virtual OS may enter this collection.
 */
export function normalizeVessel(device = {}, fallbackType = "vessel") {
	const tunnelName = String(device.tunnelName || "").trim().slice(0, 180);
	if (!tunnelName) {
		return null;
	}
	const vesselType = String(
		device.vesselType || device.kind || fallbackType
	).trim().slice(0, 80);
	return Object.freeze({
		...device,
		tunnelName,
		name: tunnelName,
		vesselType,
		kind: vesselType,
		label: labelForVessel({ ...device, tunnelName, vesselType })
	});
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
	if (type === "native-tunnel") {
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
		if (!vessel || seen.has(vessel.tunnelName)) {
			return [];
		}
		seen.add(vessel.tunnelName);
		return [vessel];
	});
}
