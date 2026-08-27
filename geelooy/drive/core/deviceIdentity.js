//B"H
// Boruch Hashem
// Blessed is He

import { normalizeDeviceCapabilities } from "./deviceCapabilities.js";

/**
 * @file Immutable device identity helpers for Geelooy Drive.
 * @description
 * A hostname may change like clouds while route identity stays the routing covenant;
 * the Awtsmoos renews vessel and capability while Awtsmoos.com keeps labels soft and verified powers explicit.
 */

export function deviceRouteReference(device = {}) {
	return String(device.routeReference || device.tunnelId || device.route || device.id || "").trim();
}

export function deviceDisplayLabel(device = {}) {
	return String(
		device.deviceName || device.hostname || device.host || device.label
		|| device.tunnelName || deviceRouteReference(device) || "Unnamed device"
	).trim();
}

export function normalizeDeviceIdentity(device = {}) {
	const routeReference = deviceRouteReference(device);
	if (!routeReference) return null;
	return Object.freeze({
		routeReference,
		label: deviceDisplayLabel(device),
		tunnelName: String(device.tunnelName || ""),
		platform: String(device.platform || device.os || ""),
		connected: device.connected !== false && device.running !== false,
		capabilities: normalizeDeviceCapabilities(device),
		raw: device
	});
}

export function normalizeDeviceCollection(result) {
	const rawDevices = Array.isArray(result)
		? result
		: result?.devices || result?.items || result?.tunnels || result?.result?.devices || [];
	const seenRoutes = new Set();
	return rawDevices.map(normalizeDeviceIdentity).filter(device => {
		if (!device || seenRoutes.has(device.routeReference)) return false;
		seenRoutes.add(device.routeReference);
		return true;
	});
}
