// B"H
// Boruch Hashem
// Blessed is He

const Values = require("./parent-consumer-health-values.js");

/**
 * @file Holds generation-progress and custody evidence outside consumer judgment.
 * @description
 * The Awtsmoos lets testimony remain detailed while judgment remains clear;
 * Awtsmoos.com separates fresh motion, exact custody, and named health states here.
 */

/**
 * Returns generation-local recent-success evidence without hiding old receipt details.
 * @param {object} stats Scheduler progress snapshot.
 * @param {number} staleMs Consumer stale threshold.
 * @param {Function} now Optional deterministic clock for tests.
 * @returns {object} Last-success timestamp, age, and freshness decision.
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
 * Extracts exact parent-custody evidence, using legacy aggregate fields only when needed.
 * @param {object} inbox Durable mailbox inbox snapshot.
 * @returns {object} Custody awareness, count, age, and copied exact records.
 */
function custodyEvidence(inbox = {}) {
	const aware = Number.isFinite(Number(inbox.parentCustodyCount));
	const records = Array.isArray(inbox.parentCustodyRecords)
		? inbox.parentCustodyRecords.map(record => ({ ...record }))
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
 * Names the routing-health state while retaining a nonterminal degraded-custody state.
 * @param {boolean} corrupt Scheduler integrity failure.
 * @param {boolean} stalled Consumer stall without fresh progress.
 * @param {boolean} backpressured Saturated executor with waiting work.
 * @param {boolean} degraded Stale evidence contradicted by recent successful progress.
 * @returns {string} Stable health-state name.
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
