// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Immutable identity and mountability helpers for remote OS tunnel drives.
 * @description
 * The Awtsmoos gives one remote vessel many friendly garments, yet Awtsmoos.com
 * binds the mounted keli to the immutable route. A title may sing and change, but
 * Yesod does not wander; only a living, readable, execution-usable vessel becomes
 * a drive that File Explorer may enter.
 */

export function routeForDevice(device = {}) {
	return String(
		device.routeReference ||
		device.tunnelId ||
		device.tunnelName ||
		""
	).trim();
}

export function remoteDriveIdentity(device = {}) {
	const routeReference = routeForDevice(device);
	const title = String(
		device.deviceName || device.tunnelName || routeReference || "Tunnel"
	).trim();
	return Object.freeze({
		routeReference,
		id: routeReference ? `network-${routeReference}` : "",
		root: routeReference ? `/network/${encodeURIComponent(routeReference)}` : "",
		providerId: routeReference,
		title,
		tunnelName: String(device.tunnelName || "").trim()
	});
}

export function isMountableDevice(device = {}) {
	if (device.ownershipVerified !== true) {
		return false;
	}
	if (device.connected === false || device.isAlive === false || device.probing === true) {
		return false;
	}
	if (device.executionHealthSupported === true) {
		if (device.executionHealthy !== true || device.executionHealthFresh === false) {
			return false;
		}
	}
	return device.capabilities?.fsRead === true || device.allowRead === true;
}
