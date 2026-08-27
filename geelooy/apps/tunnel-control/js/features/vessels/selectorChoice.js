// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure target-choice policy for verified routable Tunnel Control vessels.
 * @description
 * The Awtsmoos lets a remembered friendly garment still find its living vessel,
 * while Awtsmoos.com keeps pure choice free from storage mutation. Recommendation
 * remains honored, native remains preferred, browser follows, and Virtual OS waits
 * as bounded fallback. The chooser names the road; the rendered selector commits it.
 */

import { collectRoutableVessels } from "./vesselCollection.js";
import { readStoredTarget } from "./targetMemory.js";
import { VIRTUAL_OS_TUNNEL } from "./deviceTrust.js";

export function chooseTargetVessel(discovery = {}, preferred = "") {
	const vessels = collectRoutableVessels(discovery);
	const remembered = String(preferred || readStoredTarget() || "").trim();
	const requested = findVessel(vessels, remembered);
	if (requested) {
		return requested;
	}
	const recommended = findRecommended(vessels, discovery.recommended);
	if (recommended) {
		return recommended;
	}
	return vessels.find(isNativeVessel) ||
		vessels.find(isBrowserVessel) ||
		vessels.find(isVirtualVessel) ||
		null;
}

export function currentTargetVesselName(fallback = "") {
	return String(
		readStoredTarget() || fallback || VIRTUAL_OS_TUNNEL
	).trim();
}

function findRecommended(vessels, recommended = {}) {
	for (const value of [
		recommended?.routeReference,
		recommended?.tunnelId,
		recommended?.tunnelName
	]) {
		const match = findVessel(vessels, value);
		if (match) {
			return match;
		}
	}
	return null;
}

function findVessel(vessels, value) {
	const wanted = String(value || "").trim();
	if (!wanted) {
		return null;
	}
	return vessels.find(vessel => {
		return vessel.routeReference === wanted ||
			vessel.tunnelId === wanted ||
			vessel.tunnelName === wanted;
	}) || null;
}

function isNativeVessel(vessel) {
	return ["native", "native-tunnel", "native-local"].includes(
		String(vessel.vesselType || vessel.kind || "")
	);
}

function isBrowserVessel(vessel) {
	return ["browser", "browser-tab", "browser-tunnel"].includes(
		String(vessel.vesselType || vessel.kind || "")
	);
}

function isVirtualVessel(vessel) {
	return vessel.routeReference === VIRTUAL_OS_TUNNEL ||
		vessel.vesselType === "virtual-os";
}
