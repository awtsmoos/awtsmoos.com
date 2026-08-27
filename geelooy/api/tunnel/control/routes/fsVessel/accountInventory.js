// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Permission = require("../../core/tunnelSecurity/permissions.js");
const { listBrowserTunnels } = require("./browserClient.js");
const { findNativeTunnel, publicNativeTunnel } = require("./tunnelClient.js");
const View = require("./nativeInventoryView.js");

/**
	* @file Builds one account inventory with current authority and explicit history.
	* @description
	* The Awtsmoos keeps immutable routes while refusing to present dead shadows as
	* equal devices. Awtsmoos.com resolves every authorized ID but defaults discovery
	* to live authority or one freshest offline fallback per friendly tunnel alias.
	*/
function nativeDevice($i, entry) {
	const access = Authorization.publicAccess(entry);
	const client = findNativeTunnel($i, entry.binding);
	const live = client ? publicNativeTunnel(client) : offlineNative(entry.binding);
	return { ...live, ...access, routeReference: entry.binding.tunnelId };
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
		lastSeenAt: binding.lastAuthenticatedAt || binding.ownershipVerifiedAt || null,
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
	const allNativeDevices = Authorization.accessibleBindings(accountId)
		.map(entry => nativeDevice($i, entry));
	const view = View.partition(allNativeDevices);
	const browsers = browserDevices($i, accountId);
	return {
		nativeDevices: view.current,
		historicalNativeDevices: view.historical,
		historySummary: {
			hiddenCount: view.hiddenCount,
			totalHistorical: view.totalHistorical
		},
		allNativeDevices,
		browserDevices: browsers,
		devices: [...browsers, ...view.current]
	};
}

function resolveInventoryDevice(devices, reference) {
	const normalized = String(reference || "").trim();
	if (!normalized) return null;
	const exactId = devices.find(device => device.tunnelId === normalized);
	if (exactId) return exactId;
	const nameMatches = devices.filter(device => device.tunnelName === normalized);
	if (nameMatches.length === 1) return nameMatches[0];
	const liveMatches = nameMatches.filter(View.isRoutable);
	return liveMatches.length === 1 ? liveMatches[0] : null;
}

module.exports = {
	browserDevices,
	inventory,
	isRoutableDevice: View.isRoutable,
	nativeDevice,
	resolveInventoryDevice
};
