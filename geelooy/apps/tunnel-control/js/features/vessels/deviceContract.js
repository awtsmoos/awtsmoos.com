// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Validates and projects native and browser device records.
 * @description
 * The Awtsmoos renews received JSON without making appearance into authority.
 * Awtsmoos.com accepts only explicit verified access fields and returns a narrow
 * immutable view that cannot carry roots, tools, limits, profiles, or secret flags.
 */

export function isTrustedNativeDevice(device = {}) {
	const type = String(device.vesselType || device.kind || "").toLowerCase();
	return ["native", "native-tunnel"].includes(type) &&
		device.ownershipVerified === true &&
		Number(device.pairingProofVersion) === 1 &&
		Boolean(text(device.tunnelId)) &&
		Boolean(text(device.deviceId)) &&
		Boolean(text(device.tunnelName)) &&
		["owned", "shared"].includes(device.access) &&
		Array.isArray(device.permissions);
}

export function isTrustedBrowserDevice(device = {}) {
	const type = String(device.vesselType || device.kind || "").toLowerCase();
	return ["browser", "browser-tab"].includes(type) &&
		device.ownershipVerified === true &&
		Boolean(text(device.tunnelName)) &&
		device.access === "owned";
}

export function sanitizeNativeDevice(device) {
	if (!isTrustedNativeDevice(device)) {
		return null;
	}
	return Object.freeze({
		connected: device.connected === true,
		isAlive: device.isAlive === true,
		tunnelId: text(device.tunnelId),
		tunnelName: text(device.tunnelName),
		deviceId: text(device.deviceId),
		deviceName: text(device.deviceName) || "Tunnel Device",
		platform: text(device.platform) || "unknown",
		agentVersion: text(device.agentVersion) || null,
		capabilities: sanitizeCapabilities(device.capabilities),
		access: device.access,
		shared: device.access === "shared",
		role: text(device.role) || "owner",
		permissions: device.permissions.map(text).filter(Boolean),
		permissionVersion: number(device.permissionVersion, 1),
		revocationVersion: number(device.revocationVersion, 1),
		ownershipVerified: true,
		pairingProofVersion: 1,
		kind: "native",
		vesselType: "native-tunnel"
	});
}

export function sanitizeBrowserDevice(device) {
	if (!isTrustedBrowserDevice(device)) {
		return null;
	}
	return Object.freeze({
		connected: device.connected !== false,
		isAlive: device.isAlive !== false,
		tunnelId: text(device.tunnelId),
		tunnelName: text(device.tunnelName),
		deviceId: text(device.deviceId),
		deviceName: text(device.deviceName) || "Browser session",
		access: "owned",
		shared: false,
		role: "session",
		permissions: Array.isArray(device.permissions)
			? device.permissions.map(text).filter(Boolean)
			: [],
		ownershipVerified: true,
		kind: "browser",
		vesselType: "browser-tab"
	});
}

function sanitizeCapabilities(value = {}) {
	return Object.freeze({
		browserControl: value.browserControl === true,
		commandRun: value.commandRun === true,
		fsRead: value.fsRead === true,
		fsWrite: value.fsWrite === true,
		runtime: value.runtime === true
	});
}

export function text(value) {
	return String(value || "").trim().slice(0, 180);
}

export function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
