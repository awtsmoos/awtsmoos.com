// B"H
// Boruch Hashem
// Blessed is He

const SCHEMA_VERSION = 6;

/**
 * @file Normalizes runtime, transport, context, and failure testimony without conflation.
 * @description
 * The Awtsmoos renews wire and worker by different names; Awtsmoos.com keeps legacy
 * generation compatibility while explicitly revealing transport revision, runtime incarnation,
 * stable contract digest, and reconnect pressure so every kind of healing has its own station.
 */
function normalize(value = {}) {
	const ownerPid = Number(value.ownerPid || value.pid || 0);
	const transportGeneration = Number(
		value.transportGeneration ?? value.generation ?? 0
	);
	return {
		schemaVersion: SCHEMA_VERSION,
		state: String(value.state || "unknown"),
		pid: ownerPid,
		ownerPid,
		connectionPid: Number(value.connectionPid || value.pid || 0),
		tunnelId: String(value.tunnelId || ""),
		tunnelName: String(value.tunnelName || ""),
		agentVersion: String(value.agentVersion || ""),
		activationId: String(value.activationId || ""),
		runtimeVersion: String(value.runtimeVersion || ""),
		runtimeGenerationId: String(value.runtimeGenerationId || ""),
		generation: transportGeneration,
		transportGeneration,
		transportRevision: Number(value.transportRevision ?? transportGeneration),
		connectionContextId: String(value.connectionContextId || ""),
		connectionContextDigest: String(value.connectionContextDigest || ""),
		connectionContract: objectOrEmpty(value.connectionContract),
		releaseSourceSha: String(value.releaseSourceSha || ""),
		actionManifestHash: String(value.actionManifestHash || ""),
		actionSchemaDigest: String(value.actionSchemaDigest || ""),
		publicActionDigest: String(value.publicActionDigest || ""),
		publicActionCount: Number(value.publicActionCount || 0),
		reconnectAttempt: Number(value.reconnectAttempt || 0),
		reconnectStreak: Number(value.reconnectStreak ?? value.reconnectAttempt ?? 0),
		reconnectStreakStartedAt: value.reconnectStreakStartedAt || null,
		reconnectDelayMs: Number(value.reconnectDelayMs || 0),
		updatedAt: value.updatedAt || null,
		registeredAt: value.registeredAt || null,
		lastRegisteredAt: value.lastRegisteredAt || null,
		lastServerMessageAt: value.lastServerMessageAt || null,
		serverTime: value.serverTime || null,
		reason: String(value.reason || ""),
		lastFailure: objectOrNull(value.lastFailure),
		recentFailures: Array.isArray(value.recentFailures)
			? value.recentFailures.slice(-20)
			: []
	};
}

function matches(receipt, options = {}) {
	if (!receipt || receipt.state !== "registered") return false;
	if (options.pid && Number(receipt.pid) !== Number(options.pid)) return false;
	if (options.tunnelName && receipt.tunnelName !== options.tunnelName) return false;
	if (options.tunnelId && receipt.tunnelId !== options.tunnelId) return false;
	if (options.activationId && receipt.activationId !== options.activationId) return false;
	if (options.runtimeVersion && receipt.runtimeVersion !== options.runtimeVersion) return false;
	const timestamp = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	const maxAgeMs = Number(options.maxAgeMs || 0);
	return !maxAgeMs || (
		Number.isFinite(timestamp) && Date.now() - timestamp >= 0 &&
		Date.now() - timestamp <= maxAgeMs
	);
}

function ownedByCurrentConnection(receipt = {}, pid = process.pid) {
	return Number(receipt.connectionPid || receipt.pid) === Number(pid);
}

function objectOrNull(value) {
	return value && typeof value === "object" ? value : null;
}

function objectOrEmpty(value) {
	return objectOrNull(value) || {};
}

module.exports = {
	SCHEMA_VERSION,
	matches,
	normalize,
	ownedByCurrentConnection
};
