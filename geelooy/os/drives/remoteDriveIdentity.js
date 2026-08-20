// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Immutable identity and presentation truth for account tunnel drives.
 * @description The Awtsmoos lets a friendly machine-name change while the route remains one; Awtsmoos.com binds navigation to immutable identity and lets status sing without becoming authority.
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
	const deviceName = clean(device.deviceName);
	const tunnelName = clean(device.tunnelName);
	const platform = clean(device.platform || device.os || device.devicePlatform);
	const title = deviceName || tunnelName || routeReference || "Remote Computer";
	return Object.freeze({
		routeReference,
		id: routeReference ? `network-${routeReference}` : "",
		root: routeReference ? `/network/${encodeURIComponent(routeReference)}` : "",
		providerId: routeReference,
		title,
		subtitle: subtitleOf({ deviceName, tunnelName, platform, routeReference }),
		tunnelName,
		deviceName,
		platform,
		connectionState: "connected",
		syncState: "live",
		locality: "remote"
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

function subtitleOf({ deviceName, tunnelName, platform, routeReference }) {
	const parts = [];
	if (platform) {
		parts.push(platform);
	}
	if (tunnelName && tunnelName !== deviceName) {
		parts.push(tunnelName);
	}
	if (!parts.length && routeReference) {
		parts.push(shortRoute(routeReference));
	}
	return parts.join(" · ");
}

function shortRoute(value = "") {
	const text = String(value);
	return text.length > 22 ? `${text.slice(0, 10)}…${text.slice(-7)}` : text;
}

function clean(value) {
	return String(value || "").trim();
}
