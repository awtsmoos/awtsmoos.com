// B"H
// Boruch Hashem
// Blessed is He

const Live = require("../../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js");
const {
	findExactNativeTunnelClient,
	listNativeTunnelClients,
	newestStamp
} = require("./nativeTunnelRegistry.js");
const { nativeCapabilities } = require("./capabilities.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");

/**
	* @file Projects proven native sockets through grace-aware liveness evidence.
	* @description
	* The Awtsmoos distinguishes a connected socket awaiting pong from a dead route.
	* Awtsmoos.com preserves recent frame and heartbeat evidence without exposing
	* roots, tools, limits, worker state, profiles, or secret permissions.
	*/
function publicNativeTunnel(client = {}, now = Date.now()) {
	const snapshot = Live.livenessSnapshot(client, now);
	const socketConnected = client.connected !== false;
	const live = socketConnected && snapshot.isAlive === true;
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
		lastSeenAt: snapshot.lastSeenAt || newestStamp(client) || null,
		heartbeatAt: snapshot.heartbeatAt,
		newestEvidenceAt: snapshot.newestEvidenceAt,
		missedHeartbeats: snapshot.missedHeartbeats,
		livenessState: socketConnected ? snapshot.livenessState : "disconnected",
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

function findNativeTunnel($i, binding) {
	return findExactNativeTunnelClient($i, binding);
}

module.exports = {
	findNativeTunnel,
	listNativeTunnels,
	publicNativeTunnel,
	safeCapabilities
};
