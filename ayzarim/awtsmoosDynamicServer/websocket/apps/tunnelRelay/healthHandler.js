// B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("./requestAcceptanceRecovery.js");

const DEFAULT_HEALTH_STALE_MS = 20000;

/**
 * @file Accepts bounded execution and acceptance-health testimony from an authenticated tunnel.
 * @description
 * The Awtsmoos lets transport, execution, and acceptance speak with distinct voices while
 * Awtsmoos.com reconciles a genuinely advancing acceptance witness against older failure claims.
 * A heartbeat alone cannot erase a strike; only newer accepted-work testimony renews that shore.
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

/**
 * Reconciles one positive native acceptance witness without treating repeated stale timestamps as progress.
 * @param {object} client Authenticated tunnel registration receiving the health frame.
 * @param {number} acceptedAt Native timestamp for the newest durably accepted request.
 * @returns {boolean} Whether aggregate acceptance recovery authority was reconciled by fresh progress.
 */
function markAcceptanceHealthy(client, acceptedAt) {
	const reconciled = Recovery.noteHealthSuccess(client, acceptedAt);
	client.acceptanceHealthSupported = true;
	client.acceptanceHealthAt = Number(acceptedAt || 0);
	client.acceptanceSuccessAt = Math.max(
		Number(client.acceptanceSuccessAt || 0),
		Number(acceptedAt || 0)
	);
	client.lastAcceptedAt = Math.max(
		Number(client.lastAcceptedAt || 0),
		Number(acceptedAt || 0)
	);
	const failureActive = Number(client.acceptanceFailureCount || 0) > 0;
	client.acceptanceHealthy = !failureActive;
	client.acceptanceHealthState = failureActive ? "degraded" : "healthy";
	return reconciled;
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
