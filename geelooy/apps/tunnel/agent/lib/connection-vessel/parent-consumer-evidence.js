// B"H
// Boruch Hashem
// Blessed is He

const Values = require("./parent-consumer-health-values.js");

/**
 * @file Holds generation-local progress and parent-custody evidence.
 * @description
 * The Awtsmoos creates each moment of motion anew; one ancient receipt therefore
 * cannot erase the testimony of fresh successful work. Awtsmoos.com keeps these
 * witnesses separate so health judgment remains precise rather than superstitious.
 */

/**
 * Returns recent successful-action evidence for the current execution generation.
 *
 * @param {object} stats Scheduler progress snapshot.
 * @param {number} staleMs Consumer stale threshold in milliseconds.
 * @param {Function} now Optional deterministic clock for tests.
 * @returns {object} Timestamp, age, and freshness of recent successful work.
 */
function recentProgress(stats = {}, staleMs = 30000, now = Date.now) {
	const observedAt = typeof now === "function" ? now() : Date.now();
	const lastSuccessfulActionAt = Values.nonnegative(stats.lastSuccessfulActionAt);
	const recentSuccessAgeMs = lastSuccessfulActionAt > 0
		? Math.max(0, observedAt - lastSuccessfulActionAt)
		: Number.POSITIVE_INFINITY;

	return {
		lastSuccessfulActionAt,
		recentSuccessAgeMs,
		recentSuccess: lastSuccessfulActionAt > 0 && recentSuccessAgeMs < staleMs
	};
}

/**
 * Extracts exact parent-custody evidence with a legacy aggregate fallback.
 *
 * @param {object} inbox Durable mailbox inbox snapshot.
 * @returns {object} Custody awareness, count, age, and copied exact records.
 */
function custodyEvidence(inbox = {}) {
	const aware = Number.isFinite(Number(inbox.parentCustodyCount));
	const records = Array.isArray(inbox.parentCustodyRecords)
		? inbox.parentCustodyRecords.map((record) => ({ ...record }))
		: [];

	return {
		aware,
		count: Values.nonnegative(aware ? inbox.parentCustodyCount : inbox.count),
		oldestAgeMs: Values.nonnegative(
			aware ? inbox.parentCustodyOldestAgeMs : inbox.oldestAgeMs
		),
		records
	};
}

/**
 * Names the consumer state while preserving degraded-but-living custody separately.
 *
 * @param {boolean} corrupt Scheduler integrity failure.
 * @param {boolean} stalled Consumer stall without fresh progress.
 * @param {boolean} backpressured Saturated executor with waiting work.
 * @param {boolean} degraded Stale evidence contradicted by recent progress.
 * @returns {string} Stable consumer health-state name.
 */
function healthState(corrupt, stalled, backpressured, degraded = false) {
	if (corrupt) return "scheduler_corrupt";
	if (stalled) return "consumer_stalled";
	if (backpressured) return "consumer_backpressured";
	if (degraded) return "consumer_degraded";
	return "healthy";
}

module.exports = {
	custodyEvidence,
	healthState,
	recentProgress
};
