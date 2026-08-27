// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Fail-closed discovery sanitation for Tunnel Control.
 * @description
 * The Awtsmoos reveals only fields required for trusted human choice while
 * Awtsmoos.com preserves the historical discovery envelope consumed across the
 * app. Routes and capabilities remain visible; roots, tools, limits, and secrets do not.
 */

import {
	sanitizeBrowserDevice,
	sanitizeNativeDevice,
	text
} from "./deviceContract.js";
import {
	array,
	sanitizeIdentity,
	sanitizeVirtualDevice,
	warningsFor
} from "./discoveryHelpers.js";

export { VIRTUAL_OS_TUNNEL } from "./discoveryHelpers.js";

export function sanitizeDiscoveryResponse(raw = {}) {
	const nativeSource = array(raw.nativeDevices || raw.tunnels || raw.devices);
	const browserSource = array(raw.browserDevices);
	const nativeDevices = nativeSource
		.map(sanitizeNativeDevice)
		.filter(Boolean);
	const browserDevices = browserSource
		.map(sanitizeBrowserDevice)
		.filter(Boolean);
	const virtualDevice = sanitizeVirtualDevice(raw.virtualDevice);
	const accountDevices = [...browserDevices, ...nativeDevices];
	const devices = virtualDevice
		? [...accountDevices, virtualDevice]
		: accountDevices;
	const recommended = safeRecommendation(
		raw.recommended || raw.device || raw.tunnel,
		accountDevices,
		virtualDevice
	);
	const removed = nativeSource.length - nativeDevices.length +
		browserSource.length - browserDevices.length;
	const routeReference = text(
		recommended?.routeReference ||
		recommended?.tunnelId ||
		raw.routeReference ||
		raw.tunnelId
	);
	return Object.freeze({
		BH: "B\"H",
		ok: Boolean(recommended),
		sourceOk: raw.ok !== false,
		connected: recommended?.connected === true,
		routeReference,
		tunnelId: text(recommended?.tunnelId || raw.tunnelId),
		tunnelName: recommended?.tunnelName || text(raw.tunnelName),
		identity: sanitizeIdentity(raw.identity),
		nativeDevices,
		browserDevices,
		virtualDevice,
		devices,
		recommended,
		device: recommended,
		tunnel: recommended,
		warnings: warningsFor(raw, removed),
		error: recommended ? "" : text(raw.error) || "no_verified_device"
	});
}

function safeRecommendation(candidate, devices, virtualDevice) {
	const key = text(
		candidate?.routeReference ||
		candidate?.tunnelId ||
		candidate?.tunnelName
	);
	return devices.find(device => {
		return device.routeReference === key ||
			device.tunnelId === key ||
			device.tunnelName === key;
	}) || devices.find(device => device.connected) || virtualDevice || null;
}
