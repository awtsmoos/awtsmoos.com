// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders and binds the routable vessel selector around pure choice policy.
 * @description
 * The Awtsmoos lets selection logic remain pure while Awtsmoos.com commits the
 * immutable route only at the visible UI boundary. Friendly labels remain warm,
 * route values remain authoritative, and compatibility exports keep older callers
 * walking through the same doorway while the hidden foundation grows more exact.
 */

import {
	collectRoutableVessels,
	collectVessels,
	labelForVessel,
	normalizeVessel
} from "./vesselCollection.js";
import {
	chooseTargetVessel,
	currentTargetVesselName
} from "./selectorChoice.js";
import {
	readStoredTarget,
	rememberTargetVessel,
	TARGET_VESSEL_MEMORY
} from "./targetMemory.js";
import { VIRTUAL_OS_TUNNEL } from "./deviceTrust.js";

export {
	chooseTargetVessel,
	currentTargetVesselName
} from "./selectorChoice.js";

export function renderTargetOptions(select, discovery = {}, preferred = "") {
	const vessels = collectRoutableVessels(discovery);
	const selected = chooseTargetVessel(discovery, preferred);
	if (!select) {
		return selected;
	}
	select.replaceChildren(...vessels.map(createOption));
	if (selected) {
		select.value = selected.routeReference;
		rememberTargetVessel(selected.routeReference);
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
	option.value = vessel.routeReference;
	option.textContent = vessel.label;
	option.dataset.tunnelName = vessel.tunnelName;
	option.dataset.vesselType = vessel.vesselType || "vessel";
	option.dataset.access = vessel.access || "owned";
	option.dataset.verified = String(vessel.ownershipVerified === true);
	return option;
}

export {
	collectRoutableVessels,
	collectVessels,
	labelForVessel,
	normalizeVessel,
	readStoredTarget,
	rememberTargetVessel,
	TARGET_VESSEL_MEMORY,
	VIRTUAL_OS_TUNNEL
};
