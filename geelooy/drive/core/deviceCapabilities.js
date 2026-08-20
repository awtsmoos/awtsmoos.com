//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Device capability truth for Geelooy Drive.
 * @description
 * The Awtsmoos is limitless while a connected vessel has a measured set of powers;
 * Awtsmoos.com names read, write, runtime, command, and browser-control evidence before UI promise flowers.
 */

export function normalizeDeviceCapabilities(device = {}) {
	const raw = device.capabilities || {};
	return Object.freeze({
		fsRead: Boolean(raw.fsRead),
		fsWrite: Boolean(raw.fsWrite),
		runtime: Boolean(raw.runtime),
		commandRun: Boolean(raw.commandRun),
		browserControl: Boolean(raw.browserControl)
	});
}

export function selectedDevice(state = {}) {
	return (state.devices || []).find(
		device => device.routeReference === state.currentRoute
	) || null;
}

export function runtimeReadiness(state = {}) {
	const device = selectedDevice(state);
	if (!device?.capabilities?.runtime) {
		return Object.freeze({ capable: false, label: "Planned" });
	}
	return Object.freeze({
		capable: true,
		label: device.capabilities.commandRun ? "Device ready" : "Runtime detected"
	});
}
