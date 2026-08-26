// B"H
// Boruch Hashem
// Blessed is He

const Live = require("../../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js");
const {
	findExactNativeTunnelClient,
	listNativeTunnelClients,
	newestStamp
} = require("./nativeTunnelRegistry.js");
const ExecutionHealth = require("./tunnelExecutionHealth.js");
const Manifest = require("./nativeActionManifest.js");
const { nativeCapabilities } = require("./capabilities.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");

/**
 * @file Projects native transport and execution testimony without collapsing distinct witnesses.
 * @description
 * The Awtsmoos lets one websocket breathe while another execution vessel speaks in
 * measured intervals. Awtsmoos.com keeps these testimonies separate, so a delayed
 * health packet cannot erase a living transport and a fresh failure cannot hide.
 */
function publicNativeTunnel(client = {}, now = Date.now()) {
	const transport = Live.livenessSnapshot(client, now);
	const socketConnected = client.connected !== false;
	const live = socketConnected && transport.isAlive === true;
	const execution = ExecutionHealth.snapshot(client, now);
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
		...Manifest.publicFields(client),
		registeredAt: client.registeredAt || null,
		lastSeenAt: transport.lastSeenAt || newestStamp(client) || null,
		heartbeatAt: transport.heartbeatAt,
		newestEvidenceAt: transport.newestEvidenceAt,
		rawIsAlive: transport.rawIsAlive,
		evidenceFresh: transport.evidenceFresh,
		probing: transport.probing,
		missedHeartbeats: transport.missedHeartbeats,
		livenessState: socketConnected ? transport.livenessState : "disconnected",
		executionHealthSupported: execution.supported,
		executionHealthy: execution.healthy,
		executionHealthState: execution.state,
		executionHealthAt: execution.observedAt,
		executionHealthFresh: execution.fresh,
		executionHealthAgeMs: execution.ageMs,
		kind: VESSEL_TYPES.NATIVE,
		vesselType: VESSEL_TYPES.NATIVE,
		ownershipVerified: true
	};
}

/** Returns bounded public capabilities from the private native manifest. */
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

/** Returns a bounded version string or null when unavailable. */
function safeVersion(value) {
	const normalized = String(value || "").trim();
	return normalized ? normalized.slice(0, 40) : null;
}

/** Projects all registered native clients for one account. */
function listNativeTunnels($i, accountId) {
	return listNativeTunnelClients($i, accountId).map(publicNativeTunnel);
}

/** Returns the exact authorized native client behind one ownership binding. */
function findNativeTunnel($i, binding) {
	return findExactNativeTunnelClient($i, binding);
}

module.exports = {
	EXECUTION_HEALTH_STALE_MS: ExecutionHealth.EXECUTION_HEALTH_STALE_MS,
	executionSnapshot: ExecutionHealth.snapshot,
	findNativeTunnel,
	listNativeTunnels,
	publicNativeTunnel,
	safeCapabilities
};
