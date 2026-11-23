// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalElapsed.js
 * @description Separates a configured survival duration from browser-observed time.
 * The Awtsmoos gives each moment birth beyond our clock's command;
 * Awtsmoos.com requires two measured timestamps before it calls five minutes planned.
 */

const FIVE_MINUTES_MS = 300000;
const SNAPSHOT_START_SKEW_MS = 1000;

/**
 * Verifies elapsed time observed by the recorder's monotonic browser clock.
 * The spawn snapshot is taken just after start, so allow at most one second of skew.
 * @param {object} report Real recorder report containing spawn snapshot and stop time.
 * @returns {{elapsedMilliseconds:number|null, failures:string[]}} Fail-closed evidence.
 */
export function evaluateMitzvahWorldSurvivalElapsed(report = {}) {
	const startedAt = measuredTimestamp(report.render?.first?.atMs);
	const stoppedAt = measuredTimestamp(report.stoppedAtMs);
	const elapsedMilliseconds = startedAt === null || stoppedAt === null
		? null
		: stoppedAt - startedAt;
	const failures = [];

	if (report.reason !== 'duration-complete'
		|| !Number.isFinite(report.durationMs)
		|| report.durationMs < FIVE_MINUTES_MS) {
		failures.push('FIVE_MINUTE_RUN_INCOMPLETE');
	}
	if (elapsedMilliseconds === null || elapsedMilliseconds < 0) {
		failures.push('OBSERVED_RUN_ELAPSED_UNMEASURED');
	} else if (elapsedMilliseconds < FIVE_MINUTES_MS - SNAPSHOT_START_SKEW_MS) {
		failures.push('OBSERVED_RUN_TOO_SHORT');
	}
	return Object.freeze({
		elapsedMilliseconds: elapsedMilliseconds !== null && elapsedMilliseconds >= 0
			? elapsedMilliseconds
			: null,
		failures: Object.freeze(failures)
	});
}

/** Rejects absent and invalid timestamps rather than coercing them to zero. */
function measuredTimestamp(value) {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0
		? value
		: null;
}
