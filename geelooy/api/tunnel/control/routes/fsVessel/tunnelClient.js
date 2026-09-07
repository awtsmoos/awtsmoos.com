// B"H
// Boruch Hashem
// Blessed is He

const Live = require("../../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js");
const {
	findExactNativeTunnelClient,
	listNativeTunnelClients,
	newestStamp
} = require("./nativeTunnelRegistry.js");
const AcceptanceHealth = require("./tunnelAcceptanceHealth.js");
const ExecutionHealth = require("./tunnelExecutionHealth.js");
const Manifest = require("./nativeActionManifest.js");
const Readiness = require("./tunnelReadiness.js");
const { nativeCapabilities } = require("./capabilities.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");

/**
 * @file Projects route, execution, acceptance, and independent recovery testimony.
 * @description
 * The Awtsmoos lets transport breathe, execution labor, acceptance receive, and medicine
 * remain reachable. Awtsmoos.com exposes only the authenticated recovery boolean needed
 * to choose that separate wire while keeping private registration detail bounded.
 */
function publicNativeTunnel(client = {}, now = Date.now()) {
	const transport = Live.livenessSnapshot(client, now);
	const socketConnected = client.connected !== false;
	const live = socketConnected && transport.isAlive === true;
	const execution = ExecutionHealth.snapshot(client, now);
	const acceptance = AcceptanceHealth.snapshot(client, now);
	const readiness = Readiness.snapshot(live, execution, acceptance);
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
		acceptanceHealthSupported: acceptance.supported,
		acceptanceHealthy: acceptance.healthy,
		acceptanceHealthState: acceptance.state,
		acceptanceHealthAt: acceptance.observedAt,
		acceptanceHealthFresh: acceptance.fresh,
		acceptanceHealthAgeMs: acceptance.ageMs,
		acceptanceHealthSource: acceptance.source,
		acceptanceFailureAt: acceptance.failureAt,
		acceptanceFailureStreak: acceptance.failureStreak,
		lastAcceptedAt: acceptance.lastAcceptedAt,
		lastAcceptedReceiptId: acceptance.lastReceiptId,
		ready: readiness.ready,
		readinessState: readiness.state,
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
		recoveryControlV1: client.capabilities?.recoveryControlV1 === true,
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
	ACCEPTANCE_HEALTH_STALE_MS: AcceptanceHealth.ACCEPTANCE_HEALTH_STALE_MS,
	EXECUTION_HEALTH_STALE_MS: ExecutionHealth.EXECUTION_HEALTH_STALE_MS,
	acceptanceSnapshot: AcceptanceHealth.snapshot,
	executionSnapshot: ExecutionHealth.snapshot,
	findNativeTunnel,
	listNativeTunnels,
	publicNativeTunnel,
	readinessSnapshot: Readiness.snapshot,
	safeCapabilities
};
