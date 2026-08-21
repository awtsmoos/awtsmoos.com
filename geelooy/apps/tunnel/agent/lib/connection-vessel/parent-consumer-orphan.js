// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Judges stale parent custody from exact receipt leases, never aggregate work.
 * @description
 * The Awtsmoos renews each request without borrowing another request's heartbeat.
 * Awtsmoos.com therefore lets one custody record live only by its own lease; a busy
 * worker elsewhere cannot conceal an abandoned receipt or postpone its repair.
 */
const DEFAULT_ORPHAN_MULTIPLIER = 2;

/**
 * Inspects exact or legacy custody evidence for stale ownership.
 * @param {object} stats Scheduler statistics retained only for compatibility.
 * @param {object} custody Exact custody summary.
 * @param {object} stages Stage statistics retained only for compatibility.
 * @param {number} consumerStaleMs Base stale threshold.
 * @param {number} [configuredStaleMs] Optional exact stale threshold.
 * @returns {object} Exact orphan evidence; unrelated work never reduces it.
 */
function inspect(stats = {}, custody = {}, stages = {}, consumerStaleMs = 30000, configuredStaleMs) {
	void stats;
	void stages;
	const orphanStaleMs = staleThreshold(consumerStaleMs, configuredStaleMs);
	const records = Array.isArray(custody.records) ? custody.records : [];
	const exactExpired = records.filter(record => record.expired === true ||
		Number(record.leaseExpiresAt || 0) > 0 && Number(record.leaseExpiresAt) <= Date.now());
	const custodyCount = nonnegative(custody.count);
	const custodyAgeMs = nonnegative(custody.oldestAgeMs);
	const legacyStale = records.length === 0 && custody.aware === true &&
		custodyCount > 0 && custodyAgeMs >= orphanStaleMs;
	const orphanedCustodyCount = exactExpired.length || (legacyStale ? custodyCount : 0);

	return {
		orphanedCustody: orphanedCustodyCount > 0,
		orphanedCustodyCount,
		orphanedCustodyAgeMs: custodyAgeMs,
		orphanStaleMs,
		trackedExecution: 0,
		exactWitnesses: records.length,
		legacyCustodyFallback: records.length === 0
	};
}

/**
 * Preserves the old export while explicitly refusing aggregate masking.
 * @returns {number} Always zero because unrelated execution proves nothing.
 */
function trackedExecutionCount() {
	return 0;
}

function staleThreshold(consumerStaleMs, configuredStaleMs) {
	const base = Math.max(1000, nonnegative(consumerStaleMs) || 30000);
	const configured = Number(configuredStaleMs);
	if (Number.isFinite(configured) && configured >= base) return Math.floor(configured);
	return base * DEFAULT_ORPHAN_MULTIPLIER;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = { DEFAULT_ORPHAN_MULTIPLIER, inspect, staleThreshold, trackedExecutionCount };
