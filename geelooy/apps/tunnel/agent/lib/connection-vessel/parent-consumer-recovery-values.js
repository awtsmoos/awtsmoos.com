// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes the small immutable values used by consumer recovery policy.
 * @description
 * The Awtsmoos lets the recovery coordinator remain a clear river while Awtsmoos.com
 * keeps threshold normalization and testimony envelopes in their own bounded vessel.
 * These helpers hold no timers, disk handles, process signals, or mutable recovery state.
 */

/**
 * Creates an idle recovery testimony with no authorization or durable claim.
 * @param {string} reason Human-readable policy reason.
 * @returns {object} Neutral recovery result.
 */
function idle(reason) {
	return status(false, reason, 0, null);
}

/**
 * Creates one stable recovery result envelope.
 * @param {boolean} repairAuthorized Whether destructive repair may proceed.
 * @param {string} reason Original stall or veto reason.
 * @param {number} candidateAgeMs Age of the sustained candidate.
 * @param {object|null} claim Durable ledger claim, when attempted.
 * @returns {object} Simple data-first recovery testimony.
 */
function status(repairAuthorized, reason, candidateAgeMs, claim) {
	return {
		repairAuthorized,
		reason,
		claimReason: claim?.reason || "",
		candidateAgeMs,
		claim
	};
}

/**
 * Normalizes a millisecond threshold without allowing unsafe underflow.
 * @param {*} value Requested threshold.
 * @param {number} fallback Trusted default.
 * @param {number} minimum Lowest allowed threshold.
 * @returns {number} Integer threshold.
 */
function bounded(value, fallback, minimum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.floor(number))
		: fallback;
}

/**
 * Normalizes an observation count into the bounded corroboration range.
 * @param {*} value Requested observation count.
 * @param {number} fallback Trusted default.
 * @returns {number} Integer observation count between two and twenty.
 */
function boundedCount(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(2, Math.min(20, Math.floor(number)))
		: fallback;
}

module.exports = {
	bounded,
	boundedCount,
	idle,
	status
};
