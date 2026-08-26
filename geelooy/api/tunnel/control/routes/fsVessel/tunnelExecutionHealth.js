// B"H
// Boruch Hashem
// Blessed is He

const EXECUTION_HEALTH_STALE_MS = Number(
	process.env.AWTSMOOS_EXECUTION_HEALTH_STALE_MS || 60000
);

/**
 * @file Projects three-valued native execution health with a generous freshness covenant.
 * @description
 * The Awtsmoos renews testimony without making silence identical to failure.
 * Awtsmoos.com gives the five-second child health cadence twelve ordinary intervals
 * before calling one report stale, while fresh explicit unhealthy evidence remains
 * immediately visible and stale evidence becomes unknown rather than falsely dead.
 */
function snapshot(client = {}, now = Date.now()) {
	const supported = client.executionHealthSupported === true;
	if (!supported) return legacySnapshot();
	const observedAt = Number(client.executionHealthAt || 0);
	const ageMs = observedAt > 0 ? Math.max(0, now - observedAt) : Number.POSITIVE_INFINITY;
	const fresh = observedAt > 0 && now - observedAt >= 0 && ageMs <= EXECUTION_HEALTH_STALE_MS;
	const healthy = fresh ? client.executionHealthy === true : null;
	return {
		supported: true,
		healthy,
		fresh,
		ageMs: Number.isFinite(ageMs) ? ageMs : null,
		state: fresh
			? boundedState(client.executionHealthState, healthy)
			: "execution_health_stale",
		observedAt: observedAt || null
	};
}

/** Returns compatibility testimony for clients that predate execution-health publication. */
function legacySnapshot() {
	return {
		supported: false,
		healthy: null,
		fresh: true,
		ageMs: null,
		state: "legacy_unknown",
		observedAt: null
	};
}

/** Returns one bounded fresh-health state name without leaking arbitrary telemetry. */
function boundedState(value, healthy) {
	return String(
		value || (healthy ? "healthy" : "execution_unhealthy")
	).slice(0, 120);
}

module.exports = {
	EXECUTION_HEALTH_STALE_MS,
	legacySnapshot,
	snapshot
};
