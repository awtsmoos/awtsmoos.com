// B"H
// Boruch Hashem
// Blessed is He

import {
	collectVessels,
	labelForVessel,
	normalizeVessel
} from "./vesselCollection.js";
import {
	readStoredTarget,
	rememberTargetVessel,
	TARGET_VESSEL_MEMORY
} from "./targetMemory.js";
import { VIRTUAL_OS_TUNNEL } from "./deviceTrust.js";

/**
 * @file Selects only sanitized account vessels and the fixed Virtual OS.
 * @description
 * The Awtsmoos renews remembered names and living authority without confusing them.
 * Awtsmoos.com revalidates every preference against the current sanitized discovery
 * set, so stale foreign recommendations and raw endpoint objects can never be chosen.
 */
export function chooseTargetVessel(discovery = {}, preferred = "") {
	const vessels = collectVessels(discovery);
	const wanted = String(
		preferred || readStoredTarget() || discovery.recommended?.tunnelName || ""
	).trim();
	return vessels.find((vessel) => vessel.tunnelName === wanted) ||
		vessels.find((vessel) => vessel.connected &&
			vessel.tunnelName !== VIRTUAL_OS_TUNNEL) ||
		vessels.find((vessel) => vessel.tunnelName === VIRTUAL_OS_TUNNEL) ||
		null;
}

export function currentTargetVesselName(fallback = "") {
	return String(
		readStoredTarget() || fallback || VIRTUAL_OS_TUNNEL
	).trim();
}

export function renderTargetOptions(select, discovery = {}, preferred = "") {
	const vessels = collectVessels(discovery);
	const selected = chooseTargetVessel(discovery, preferred);
	if (!select) {
		return selected;
	}
	select.replaceChildren(...vessels.map(createOption));
	if (selected) {
		select.value = selected.tunnelName;
		rememberTargetVessel(selected.tunnelName);
	} else {
		rememberTargetVessel("");
	}
	return selected;
}

export function bindTargetSelect(select, onChange = () => {}) {
	if (!select || select.dataset.awtTargetBound === "true") {
		return;
	}
	select.dataset.awtTargetBound = "true";
	select.addEventListener("change", () => {
		onChange(rememberTargetVessel(select.value));
	});
}

function createOption(vessel) {
	const option = document.createElement("option");
	option.value = vessel.tunnelName;
	option.textContent = vessel.label;
	option.dataset.vesselType = vessel.vesselType || "vessel";
	option.dataset.access = vessel.access || "owned";
	option.dataset.verified = String(vessel.ownershipVerified === true);
	return option;
}

export {
	collectVessels,
	labelForVessel,
	normalizeVessel,
	readStoredTarget,
	rememberTargetVessel,
	TARGET_VESSEL_MEMORY,
	VIRTUAL_OS_TUNNEL
};
