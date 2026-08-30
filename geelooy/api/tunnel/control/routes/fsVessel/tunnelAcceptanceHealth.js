// B"H
// Boruch Hashem
// Blessed is He

const ACCEPTANCE_HEALTH_STALE_MS = Number(
	process.env.AWTSMOOS_ACCEPTANCE_HEALTH_STALE_MS || 30_000
);

/**
 * @file Separates proof of native deed acceptance from transport and execution testimony.
 * @description
 * The Awtsmoos lets a heartbeat breathe while a deed still seeks its gate;
 * Awtsmoos.com remembers which witness is newest, so stale success cannot masquerade as current state.
 */
function snapshot(client = {}, now = Date.now()) {
	const custody = custodyOf(client);
	const custodyAt = stamp(custody.lastAcceptedAt || client.lastAcceptedAt);
	const explicitAt = stamp(client.acceptanceHealthAt);
	const failureAt = failureStamp(client, explicitAt);
	const successAt = successStamp(client, custodyAt, explicitAt);
	const observedAt = Math.max(failureAt, successAt, explicitAt);
	const supported = Boolean(
		client.acceptanceHealthSupported === true ||
		typeof client.acceptanceHealthy === "boolean" ||
		custodyAt > 0
	);
	const ageMs = observedAt > 0 ? Math.max(0, now - observedAt) : null;
	const fresh = supported && observedAt > 0 && ageMs <= ACCEPTANCE_HEALTH_STALE_MS;
	const healthy = healthValue(client, fresh, successAt, failureAt);
	return {
		supported,
		healthy,
		state: healthState(client, supported, fresh, healthy),
		observedAt: observedAt || null,
		ageMs,
		fresh,
		source: healthSource(client, custodyAt, successAt, failureAt),
		lastAcceptedAt: custodyAt || null,
		lastReceiptId: String(custody.lastReceiptId || client.lastAcceptedReceiptId || ""),
		failureAt: failureAt || null,
		failureStreak: nonnegative(client.acceptanceFailureStreak)
	};
}

/** Returns native parent custody whether carried directly or inside a connection view. */
function custodyOf(client = {}) {
	return client.parentCustody || client.connection?.parentCustody || {};
}

/** Returns explicit acceptance-failure time, including a negative health witness. */
function failureStamp(client, explicitAt) {
	return Math.max(
		stamp(client.acceptanceFailureAt),
		stamp(client.acceptanceLastFailureAt),
		client.acceptanceHealthy === false ? explicitAt : 0
	);
}

/** Returns the newest positive acceptance witness. */
function successStamp(client, custodyAt, explicitAt) {
	return Math.max(
		custodyAt,
		stamp(client.acceptanceSuccessAt),
		client.acceptanceHealthy === true ? explicitAt : 0
	);
}

/** Resolves tri-state acceptance health only while its evidence remains fresh. */
function healthValue(client, fresh, successAt, failureAt) {
	if (!fresh) return null;
	if (failureAt > successAt) return false;
	if (successAt > 0) return true;
	return typeof client.acceptanceHealthy === "boolean" ? client.acceptanceHealthy : null;
}

/** Names unsupported, stale, healthy, or unavailable acceptance without inventing certainty. */
function healthState(client, supported, fresh, healthy) {
	if (!supported) return "unsupported";
	if (!fresh) return "acceptance_unproven";
	if (healthy === false) return String(client.acceptanceHealthState || "acceptance_unavailable");
	if (healthy === true) return String(client.acceptanceHealthState || "healthy");
	return "acceptance_unproven";
}

/** Names the strongest witness so operators can see why readiness changed. */
function healthSource(client, custodyAt, successAt, failureAt) {
	if (failureAt > successAt) return "server_acceptance_failure";
	if (custodyAt > 0 && custodyAt === successAt) return "native_parent_custody";
	if (client.acceptanceHealthSupported === true) return "server_acceptance_health";
	return "none";
}

/** Normalizes timestamps from epoch values or ISO strings. */
function stamp(value) {
	const parsed = typeof value === "number" ? value : Date.parse(value || "");
	return Number.isFinite(parsed) ? parsed : 0;
}

/** Returns one safe nonnegative integer telemetry value. */
function nonnegative(value) {
	const parsed = Number(value || 0);
	return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

module.exports = {
	ACCEPTANCE_HEALTH_STALE_MS,
	snapshot,
	stamp
};
