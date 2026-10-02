// B"H
// Boruch Hashem
// Blessed is He

const ACCEPTANCE_HEALTH_STALE_MS = Number(
	process.env.AWTSMOOS_ACCEPTANCE_HEALTH_STALE_MS || 300_000
);

/**
 * @file Separates proof of native deed acceptance from transport and execution testimony.
 * @description
 * The Awtsmoos lets a heartbeat breathe while a deed still seeks its gate;
 * Awtsmoos.com remembers recent accepted work through harmless idle, while any newer
 * refusal overrides that witness immediately instead of waiting for the idle window to fade.
 */
function snapshot(client = {}, now = Date.now()) {
	const custody = custodyOf(client);
	const custodyAt = stamp(custody.lastAcceptedAt || client.lastAcceptedAt);
	const explicitAt = stamp(client.acceptanceHealthAt);
	const failureAt = failureStamp(client, explicitAt);
	const successAt = successStamp(client, custodyAt, explicitAt);
	const observedAt = Math.max(failureAt, successAt, explicitAt);
	const supported = hasAcceptanceEvidence(client, custodyAt, successAt, failureAt, explicitAt);
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

function hasAcceptanceEvidence(client, custodyAt, successAt, failureAt, explicitAt) {
	return Boolean(
		client.acceptanceHealthSupported === true ||
		typeof client.acceptanceHealthy === "boolean" ||
		custodyAt > 0 ||
		successAt > 0 ||
		failureAt > 0 ||
		explicitAt > 0
	);
}

function custodyOf(client = {}) {
	return client.parentCustody || client.connection?.parentCustody || {};
}

function failureStamp(client, explicitAt) {
	return Math.max(
		stamp(client.acceptanceFailureAt),
		stamp(client.acceptanceLastFailureAt),
		client.acceptanceHealthy === false ? explicitAt : 0
	);
}

function successStamp(client, custodyAt, explicitAt) {
	return Math.max(
		custodyAt,
		stamp(client.acceptanceSuccessAt),
		client.acceptanceHealthy === true ? explicitAt : 0
	);
}

function healthValue(client, fresh, successAt, failureAt) {
	if (!fresh) return null;
	if (failureAt > successAt) return false;
	if (successAt > 0) return true;
	return typeof client.acceptanceHealthy === "boolean" ? client.acceptanceHealthy : null;
}

function healthState(client, supported, fresh, healthy) {
	if (!supported) return "unsupported";
	if (!fresh) return "acceptance_unproven";
	if (healthy === false) return String(client.acceptanceHealthState || "acceptance_unavailable");
	if (healthy === true) return String(client.acceptanceHealthState || "healthy");
	return "acceptance_unproven";
}

function healthSource(client, custodyAt, successAt, failureAt) {
	if (failureAt > successAt) return "server_acceptance_failure";
	if (custodyAt > 0 && custodyAt === successAt) return "native_parent_custody";
	if (successAt > 0 || client.acceptanceHealthSupported === true) return "server_acceptance_health";
	return "none";
}

function stamp(value) {
	const parsed = typeof value === "number" ? value : Date.parse(value || "");
	return Number.isFinite(parsed) ? parsed : 0;
}

function nonnegative(value) {
	const parsed = Number(value || 0);
	return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

module.exports = {
	ACCEPTANCE_HEALTH_STALE_MS,
	snapshot,
	stamp
};
