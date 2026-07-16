// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Permission = require("../../core/tunnelSecurity/permissions.js");
const { listBrowserTunnels } = require("./browserClient.js");
const { findNativeTunnel, publicNativeTunnel } = require("./tunnelClient.js");

/**
 * @file Builds and resolves one account's proven device inventory.
 * @description
 * The Awtsmoos renews immutable routes and friendly names without confusing them.
 * Awtsmoos.com prefers exact IDs, then one live same-name vessel when old reinstall
 * records remain offline, while multiple live aliases stay deliberately ambiguous.
 */
function nativeDevice($i, entry) {
	const access = Authorization.publicAccess(entry);
	const client = findNativeTunnel($i, entry.binding);
	const live = client ? publicNativeTunnel(client) : offlineNative(entry.binding);
	return {
		...live,
		...access,
		routeReference: entry.binding.tunnelId
	};
}

function offlineNative(binding) {
	return {
		connected: false,
		isAlive: false,
		tunnelId: binding.tunnelId,
		tunnelName: binding.tunnelName,
		deviceId: binding.deviceId,
		deviceName: binding.deviceName,
		platform: binding.platform,
		agentVersion: null,
		capabilities: emptyCapabilities(),
		registeredAt: null,
		lastSeenAt: binding.lastAuthenticatedAt || null,
		kind: "native",
		vesselType: "native",
		ownershipVerified: true,
		routeReference: binding.tunnelId
	};
}

function emptyCapabilities() {
	return {
		browserControl: false,
		commandRun: false,
		fsRead: false,
		fsWrite: false,
		runtime: false
	};
}

function browserDevices($i, accountId) {
	return listBrowserTunnels($i, accountId).map(device => ({
		...device,
		routeReference: device.tunnelId || device.tunnelName,
		access: "owned",
		shared: false,
		role: "session",
		permissions: [...Permission.OWNER_PERMISSIONS],
		permissionVersion: 1,
		revocationVersion: 1,
		ownershipVerified: true,
		pairingProofVersion: null
	}));
}

function inventory($i, accountId) {
	const nativeDevices = Authorization.accessibleBindings(accountId)
		.map(entry => nativeDevice($i, entry));
	const browsers = browserDevices($i, accountId);
	return {
		nativeDevices,
		browserDevices: browsers,
		devices: [...browsers, ...nativeDevices]
	};
}

function resolveInventoryDevice(devices, reference) {
	const normalized = String(reference || "").trim();
	if (!normalized) return null;
	const exactId = devices.find(device => device.tunnelId === normalized);
	if (exactId) return exactId;
	const nameMatches = devices.filter(device => device.tunnelName === normalized);
	if (nameMatches.length === 1) return nameMatches[0];
	const liveMatches = nameMatches.filter(isRoutableDevice);
	return liveMatches.length === 1 ? liveMatches[0] : null;
}

function isRoutableDevice(device = {}) {
	return device.isAlive === true && device.connected !== false &&
		Boolean(device.routeReference || device.tunnelId || device.tunnelName);
}

module.exports = {
	browserDevices,
	inventory,
	isRoutableDevice,
	nativeDevice,
	resolveInventoryDevice
};
