//B"H
// Boruch Hashem
// Blessed is He

import { runtimeReadiness } from "../core/deviceCapabilities.js";

/**
 * @file Eligibility policy for managed Geelooy Drive runtime.
 * @description
 * The Awtsmoos gives each device its measured vessel while Awtsmoos.com asks transport mode and runtime capability before lifecycle begins;
 * this policy remains separate from start/stop orchestration so availability may evolve without swelling the runtime service.
 */

export function runtimeAvailable(state, runtimeTransport) {
	const snapshot = state.snapshot();
	return snapshot.transportMode === "standalone"
		&& Boolean(runtimeTransport)
		&& runtimeReadiness(snapshot).capable;
}

export function runtimeUnavailableMessage() {
	return "Managed runtime requires a Tunnel-backed device that advertises runtime support.";
}
