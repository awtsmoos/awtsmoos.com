// B"H
// Boruch Hashem
// Blessed is He

import { rememberTargetVessel } from "./targetMemory.js";
import { VIRTUAL_OS_TUNNEL } from "./deviceTrust.js";

/**
 * @file Stores only account-verified targets from the latest discovery response.
 * @description
 * The Awtsmoos renews remembered preference and present authority separately.
 * Awtsmoos.com routes by stable reference, yet remembers the friendly display name
 * so a reinstall can recover naturally without trusting an obsolete local alias.
 */
const trustedTargets = new Map();
let selectedReference = VIRTUAL_OS_TUNNEL;

export function replaceTrustedTargets(vessels = [], preferred = "") {
	trustedTargets.clear();
	for (const vessel of vessels) {
		if (!isRegistryVessel(vessel)) continue;
		trustedTargets.set(
			vessel.routeReference,
			Object.freeze({ ...vessel })
		);
	}
	selectedReference = chooseReference(preferred);
	rememberSelection();
	return currentTrustedVessel();
}

export function selectTrustedTarget(referenceOrName) {
	const normalized = String(referenceOrName || "").trim();
	const matching = findByReferenceOrName(normalized);
	if (matching) selectedReference = matching.routeReference;
	if (!trustedTargets.has(selectedReference)) {
		selectedReference = chooseReference("");
	}
	rememberSelection();
	return currentTrustedVessel();
}

export function currentTrustedTarget() {
	return currentTrustedVessel()?.routeReference || VIRTUAL_OS_TUNNEL;
}

export function currentTrustedDisplayName() {
	return currentTrustedVessel()?.tunnelName || VIRTUAL_OS_TUNNEL;
}

export function currentTrustedVessel() {
	return trustedTargets.get(selectedReference) ||
		trustedTargets.get(VIRTUAL_OS_TUNNEL) ||
		null;
}

export function trustedTargetList() {
	return [...trustedTargets.values()];
}

export function clearTrustedTargets() {
	trustedTargets.clear();
	selectedReference = VIRTUAL_OS_TUNNEL;
	rememberTargetVessel("");
}

function chooseReference(preferred) {
	const wanted = String(preferred || "").trim();
	const requested = findByReferenceOrName(wanted);
	if (requested) return requested.routeReference;
	const connected = [...trustedTargets.values()].find((vessel) => {
		return vessel.connected !== false &&
			vessel.routeReference !== VIRTUAL_OS_TUNNEL;
	});
	return connected?.routeReference ||
		(trustedTargets.has(VIRTUAL_OS_TUNNEL) ? VIRTUAL_OS_TUNNEL : "");
}

function findByReferenceOrName(value) {
	if (!value) return null;
	if (trustedTargets.has(value)) return trustedTargets.get(value);
	return [...trustedTargets.values()].find((vessel) => {
		return vessel.tunnelName === value || vessel.tunnelId === value;
	}) || null;
}

function rememberSelection() {
	const vessel = currentTrustedVessel();
	rememberTargetVessel(vessel?.tunnelName || "");
}

function isRegistryVessel(vessel = {}) {
	return Boolean(vessel.routeReference && vessel.tunnelName) &&
		vessel.ownershipVerified === true &&
		(
			vessel.routeReference === VIRTUAL_OS_TUNNEL ||
			["owned", "shared"].includes(vessel.access)
		);
}
