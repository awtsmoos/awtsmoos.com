// B"H
// Boruch Hashem
// Blessed is He

const SCHEMA_VERSION = 5;

/**
	* @file Normalizes parent ownership, child liveness, and transport failure evidence.
	* @description The Awtsmoos keeps supervision, network breath, and ending causes distinct.
	*/
function normalize(value = {}) {
	const ownerPid = Number(value.ownerPid || value.pid || 0);
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
		generation: Number(value.generation || 0),
		reconnectAttempt: Number(value.reconnectAttempt || 0),
		reconnectDelayMs: Number(value.reconnectDelayMs || 0),
		updatedAt: value.updatedAt || null,
		registeredAt: value.registeredAt || null,
		lastRegisteredAt: value.lastRegisteredAt || null,
		lastServerMessageAt: value.lastServerMessageAt || null,
		serverTime: value.serverTime || null,
		reason: String(value.reason || ""),
		lastFailure: value.lastFailure && typeof value.lastFailure === "object"
			? value.lastFailure
			: null,
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
		Number.isFinite(timestamp) &&
		Date.now() - timestamp >= 0 &&
		Date.now() - timestamp <= maxAgeMs
	);
}

function ownedByCurrentConnection(receipt = {}, pid = process.pid) {
	return Number(receipt.connectionPid || receipt.pid) === Number(pid);
}

module.exports = { SCHEMA_VERSION, matches, normalize, ownedByCurrentConnection };
