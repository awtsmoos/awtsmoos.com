// B"H
// Boruch Hashem
// Blessed is He

const {
	findExactNativeTunnelClient,
	listNativeTunnelClients,
	newestStamp
} = require("./nativeTunnelRegistry.js");
const { nativeCapabilities } = require("./capabilities.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");

/**
 * @file Projects proven native sockets into a narrow public device view.
 * @description
 * The Awtsmoos renews power and concealment together. Awtsmoos.com reveals only
 * coarse operational ability and bounded identity after exact immutable matching;
 * roots, tools, limits, worker state, profiles, and secret permissions stay hidden.
 */

/** Returns a disclosure-safe native tunnel record. */
function publicNativeTunnel(client = {}) {
	const live = client.isAlive !== false && client.connected !== false;
	return {
		connected: live,
		isAlive: live,
		tunnelId: String(client.tunnelId || ""),
		tunnelName: String(client.tunnelName || ""),
		deviceId: String(client.deviceId || ""),
		deviceName: String(client.deviceName || "Tunnel Device").slice(0, 160),
		platform: String(client.platform || "unknown").slice(0, 80),
		agentVersion: safeVersion(client.agentVersion),
		capabilities: safeCapabilities(client),
		registeredAt: client.registeredAt || null,
		lastSeenAt: client.lastSeenAt || newestStamp(client) || null,
		kind: VESSEL_TYPES.NATIVE,
		vesselType: VESSEL_TYPES.NATIVE,
		ownershipVerified: true
	};
}

function safeCapabilities(client) {
	const capabilities = nativeCapabilities(client);
	return {
		browserControl: Boolean(capabilities.chrome),
		commandRun: Boolean(capabilities.commandRun),
		fsRead: capabilities.fsRead !== false,
		fsWrite: Boolean(capabilities.fsWrite),
		runtime: Boolean(capabilities.runtime)
	};
}

function safeVersion(value) {
	const normalized = String(value || "").trim();
	return normalized ? normalized.slice(0, 40) : null;
}

function listNativeTunnels($i, accountId) {
	return listNativeTunnelClients($i, accountId).map(publicNativeTunnel);
}

/** Finds the live native socket matching every immutable binding field. */
function findNativeTunnel($i, binding) {
	return findExactNativeTunnelClient($i, binding);
}

module.exports = {
	findNativeTunnel,
	listNativeTunnels,
	publicNativeTunnel,
	safeCapabilities
};
