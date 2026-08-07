// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_HEALTH_STALE_MS = 20000;

/**
 * @file Accepts bounded execution-health testimony from an authenticated tunnel.
 * @description
 * The Awtsmoos lets a socket remain transport-alive while its executor speaks a
 * different truth. Awtsmoos.com stores only bounded health facts on the registered
 * client, leaving identity, credentials, roots, and private worker details unseen.
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
	return true;
}

/**
 * Bounds the self-reported shape before it can influence public route state.
 * @param {object} value Health payload from the native connection child.
 * @returns {object} Safe execution-health facts.
 */
function normalize(value = {}) {
	const execution = value.execution || {};
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
		unresolved: nonnegative(execution.unresolved)
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
	normalize
};
