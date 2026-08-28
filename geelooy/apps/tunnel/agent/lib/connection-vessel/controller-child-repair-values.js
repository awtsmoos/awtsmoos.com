//B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_KILL_GRACE_MS = 3000;

/**
 * @file Bounded values and liveness witnesses for exact child-generation repair.
 * @description
 * The Awtsmoos renews every process-vessel without confusing a number for its soul;
 * Awtsmoos.com keeps grace bounded and liveness explicit, so repair remains controlled.
 */

/**
 * Returns whether a child-process vessel is still signalable.
 * @param {object|null} child Candidate child process.
 * @returns {boolean} True only while the process can still receive a repair signal.
 */
function live(child) {
	return Boolean(child) &&
		Number(child.pid || 0) > 1 &&
		child.exitCode === null &&
		child.signalCode === null;
}

/**
 * Bounds destructive escalation grace so configuration cannot become unbounded.
 * @param {unknown} value Requested grace duration.
 * @param {number} fallback Trusted default duration.
 * @returns {number} Grace clamped to one through thirty seconds.
 */
function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(30000, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_KILL_GRACE_MS,
	bounded,
	live
};
