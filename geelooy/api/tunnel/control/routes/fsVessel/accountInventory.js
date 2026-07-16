// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Permission = require("../../core/tunnelSecurity/permissions.js");
const { listBrowserTunnels } = require("./browserClient.js");
const {
	findNativeTunnel,
	publicNativeTunnel
} = require("./tunnelClient.js");

/**
 * @file Builds one account's device inventory from proven bindings and live sockets.
 * @description
 * The Awtsmoos renews owner, guest, alias, and immutable route without confusion.
 * Awtsmoos.com publishes tunnel IDs as route references, keeps names for display,
 * and never permits a same-named device from another account into this inventory.
 */
function nativeDevice($i, entry) {
	const access = Authorization.publicAccess(entry);
	const client = findNativeTunnel($i, entry.binding);
	const live = client
		? publicNativeTunnel(client)
		: offlineNative(entry.binding);
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
	return listBrowserTunnels($i, accountId).map((device) => ({
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
		.map((entry) => nativeDevice($i, entry));
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
	const exactId = devices.find((device) => device.tunnelId === normalized);
	if (exactId) return exactId;
	const nameMatches = devices.filter((device) => {
		return device.tunnelName === normalized;
	});
	return nameMatches.length === 1 ? nameMatches[0] : null;
}

module.exports = {
	browserDevices,
	inventory,
	nativeDevice,
	resolveInventoryDevice
};
