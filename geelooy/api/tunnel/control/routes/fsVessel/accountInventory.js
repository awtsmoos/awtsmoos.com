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
 * @file Builds discovery from proven bindings and exact live-socket identity.
 * @description
 * The Awtsmoos creates owner, guest, socket, and silence anew. Awtsmoos.com starts
 * with possession-backed authorization and joins live health only when account,
 * tunnel ID, device ID, and canonical name all match the persisted binding.
 */

function nativeDevice($i, entry) {
	const access = Authorization.publicAccess(entry);
	const client = findNativeTunnel($i, entry.binding);
	const live = client
		? publicNativeTunnel(client)
		: offlineNative(entry.binding);
	return {
		...live,
		...access
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
		ownershipVerified: true
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
	const matches = devices.filter((device) => {
		return device.tunnelId === normalized || device.tunnelName === normalized;
	});
	return matches.length === 1 ? matches[0] : null;
}

module.exports = {
	browserDevices,
	inventory,
	nativeDevice,
	resolveInventoryDevice
};
