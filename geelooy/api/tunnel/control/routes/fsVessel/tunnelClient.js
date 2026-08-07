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

const EXECUTION_HEALTH_STALE_MS = Number(
	process.env.AWTSMOOS_EXECUTION_HEALTH_STALE_MS || 20000
);

/**
 * @file Projects transport liveness and execution health as separate public truths.
 * @description
 * The Awtsmoos lets an old client cross the upgrade bridge without pretending a
 * new client's stale executor is healthy. Awtsmoos.com preserves transport facts,
 * then fail-closes execution only after that client declares health support.
 */
function publicNativeTunnel(client = {}, now = Date.now()) {
	const transport = Live.livenessSnapshot(client, now);
	const socketConnected = client.connected !== false;
	const live = socketConnected && transport.isAlive === true;
	const execution = executionSnapshot(client, now);
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
		kind: VESSEL_TYPES.NATIVE,
		vesselType: VESSEL_TYPES.NATIVE,
		ownershipVerified: true
	};
}

/**
 * Applies strict freshness only after a client opts into execution-health testimony.
 * @param {object} client Registered native websocket client.
 * @param {number} now Observation time.
 * @returns {object} Backward-compatible execution health projection.
 */
function executionSnapshot(client = {}, now = Date.now()) {
	const supported = client.executionHealthSupported === true;
	if (!supported) {
		return { supported: false, healthy: null, fresh: true, state: "legacy_unknown", observedAt: null };
	}
	const observedAt = Number(client.executionHealthAt || 0);
	const fresh = observedAt > 0 && now - observedAt >= 0 &&
		now - observedAt <= EXECUTION_HEALTH_STALE_MS;
	const healthy = fresh && client.executionHealthy === true;
	return {
		supported: true,
		healthy,
		fresh,
		state: fresh
			? String(client.executionHealthState || (healthy ? "healthy" : "execution_unhealthy")).slice(0, 120)
			: "execution_health_stale",
		observedAt: observedAt || null
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
	EXECUTION_HEALTH_STALE_MS,
	executionSnapshot,
	findNativeTunnel,
	listNativeTunnels,
	publicNativeTunnel,
	safeCapabilities
};
