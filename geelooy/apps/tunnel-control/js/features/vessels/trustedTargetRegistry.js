// B"H
// Boruch Hashem
// Blessed is He

import { rememberTargetVessel } from "./targetMemory.js";
import { VIRTUAL_OS_TUNNEL } from "./deviceTrust.js";

/**
 * @file Owns the in-memory set of targets proven by the latest discovery response.
 * @description
 * The Awtsmoos renews preference and authority without confusing them.
 * Awtsmoos.com lets persisted names request a choice, but only the current sanitized
 * registry may select or expose a tunnel name to actions, prompts, or API calls.
 */
const trustedTargets = new Map();
let selectedName = VIRTUAL_OS_TUNNEL;

export function replaceTrustedTargets(vessels = [], preferred = "") {
	trustedTargets.clear();
	for (const vessel of vessels) {
		if (isRegistryVessel(vessel)) {
			trustedTargets.set(vessel.tunnelName, Object.freeze({ ...vessel }));
		}
	}
	selectedName = chooseName(preferred);
	rememberTargetVessel(selectedName);
	return currentTrustedVessel();
}

export function selectTrustedTarget(name) {
	const normalized = String(name || "").trim();
	if (trustedTargets.has(normalized)) {
		selectedName = normalized;
	}
	if (!trustedTargets.has(selectedName)) {
		selectedName = chooseName("");
	}
	rememberTargetVessel(selectedName);
	return currentTrustedVessel();
}

export function currentTrustedTarget() {
	return currentTrustedVessel()?.tunnelName || VIRTUAL_OS_TUNNEL;
}

export function currentTrustedVessel() {
	return trustedTargets.get(selectedName) ||
		trustedTargets.get(VIRTUAL_OS_TUNNEL) ||
		null;
}

export function trustedTargetList() {
	return [...trustedTargets.values()];
}

export function clearTrustedTargets() {
	trustedTargets.clear();
	selectedName = VIRTUAL_OS_TUNNEL;
	rememberTargetVessel("");
}

function chooseName(preferred) {
	const wanted = String(preferred || "").trim();
	if (trustedTargets.has(wanted)) {
		return wanted;
	}
	const connected = [...trustedTargets.values()].find((vessel) => {
		return vessel.connected !== false && vessel.tunnelName !== VIRTUAL_OS_TUNNEL;
	});
	return connected?.tunnelName ||
		(trustedTargets.has(VIRTUAL_OS_TUNNEL) ? VIRTUAL_OS_TUNNEL : "");
}

function isRegistryVessel(vessel = {}) {
	return Boolean(vessel.tunnelName) &&
		vessel.ownershipVerified === true &&
		(
			vessel.tunnelName === VIRTUAL_OS_TUNNEL ||
			["owned", "shared"].includes(vessel.access)
		);
}
