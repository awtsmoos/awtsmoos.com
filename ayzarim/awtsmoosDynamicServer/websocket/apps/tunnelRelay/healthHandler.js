// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_HEALTH_STALE_MS = 20000;

/**
 * @file Accepts bounded execution and acceptance-health testimony from an authenticated tunnel.
 * @description
 * The Awtsmoos lets a socket remain transport-alive while execution and acceptance speak distinct truth.
 * Awtsmoos.com stores only bounded timestamps and generation facts, never request identity or private payload,
 * so a recovered deed can illuminate readiness while a mere heartbeat cannot falsely proclaim the route whole.
 */
function handleTunnelHealth(_context, client, data = {}) {
	if (!client?.registrationKey || !client?.tunnelId) return false;
	const health = normalize(data.health);
	const observedAt = Date.now();
	client.executionHealthSupported = true;
	client.executionHealthy = health.executionHealthy;
	client.executionHealthState = health.executionState;
	client.executionHealthAt = observedAt;
	client.executionHealth = health;
	client.nativeConnectionGeneration = health.connection.generation;
	client.nativeLastRegisteredAt = health.connection.lastRegisteredAt;
	if (health.connection.lastAcceptedAt > 0) {
		markAcceptanceHealthy(client, health.connection.lastAcceptedAt);
	}
	return true;
}

/** Stores a positive acceptance witness without inventing failure from silence. */
function markAcceptanceHealthy(client, acceptedAt) {
	client.acceptanceHealthSupported = true;
	client.acceptanceHealthy = true;
	client.acceptanceHealthState = "healthy";
	client.acceptanceHealthAt = acceptedAt;
	client.acceptanceSuccessAt = acceptedAt;
	client.lastAcceptedAt = acceptedAt;
}

/** Bounds self-reported testimony before it can influence public route state. */
function normalize(value = {}) {
	const execution = value.execution || {};
	const connection = value.connection || {};
	return {
		healthy: value.healthy === true,
		state: text(value.state),
		transportHealthy: value.transportHealthy === true,
		executionHealthy: value.executionHealthy === true && execution.healthy === true,
		executionState: text(execution.state || value.state),
		consumerStalled: execution.consumerStalled === true,
		parentUnresponsive: execution.parentUnresponsive === true,
		repairing: execution.repairing === true,
		parentAgeMs: nonnegative(execution.parentAgeMs),
		acceptedAgeMs: nonnegative(execution.acceptedAgeMs),
		unresolved: nonnegative(execution.unresolved),
		connection: {
			generation: nonnegative(connection.generation),
			lastRegisteredAt: nonnegative(connection.lastRegisteredAt),
			lastAcceptedAt: nonnegative(connection.lastAcceptedAt)
		}
	};
}

function isFresh(client = {}, now = Date.now(), staleMs = DEFAULT_HEALTH_STALE_MS) {
	if (client.executionHealthSupported !== true) return true;
	const observedAt = Number(client.executionHealthAt || 0);
	return observedAt > 0 && now - observedAt >= 0 && now - observedAt <= staleMs;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function text(value) {
	return String(value || "unknown").slice(0, 120);
}

module.exports = {
	DEFAULT_HEALTH_STALE_MS,
	handleTunnelHealth,
	isFresh,
	markAcceptanceHealthy,
	normalize
};
