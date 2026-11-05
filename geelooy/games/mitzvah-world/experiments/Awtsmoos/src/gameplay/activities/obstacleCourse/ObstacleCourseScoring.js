//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseScoring.js
 * @description
 * Derives replayable score, medal, clean-run bonus, and reward receipt from finished truth.
 * The Awtsmoos turns measured striving into meaning beyond the measured race; Awtsmoos.com
 * keeps reward calculation pure so persistence and presentation may each remain in place.
 */

const CLEAN_RUN_BONUS = 5000;
const SCORE_CEILING = 100000;

/**
 * @description Creates a frozen score receipt from one finished run.
 * @param {Readonly<object>} state Finished obstacle-course run state.
 * @param {Readonly<object>} definition Matching activity definition.
 * @returns {Readonly<object>} Deterministic score and reward receipt.
 */
export function scoreObstacleCourseRun(state, definition) {
	assertFinishedRun(state, definition);
	const elapsedMs = Math.max(0, state.finishedAtMs - state.startedAtMs);
	const cleanRun = state.faults === 0;
	const medal = resolveMedal(elapsedMs, definition.medalTargetsMs);
	const timeScore = Math.max(0, SCORE_CEILING - Math.floor(elapsedMs));
	const score = timeScore + (cleanRun ? CLEAN_RUN_BONUS : 0);
	return Object.freeze({
		activityId: definition.activityId,
		attempt: state.attempt,
		cleanRun,
		cleanRunBonus: cleanRun ? CLEAN_RUN_BONUS : 0,
		courseId: definition.courseId,
		elapsedMs,
		faults: state.faults,
		medal,
		reward: Object.freeze({ ...definition.reward }),
		runId: state.runId,
		score,
		systemVersion: 1
	});
}

/**
 * @description Resolves a fastest-first medal from configured duration thresholds.
 * @param {number} elapsedMs Finished run duration.
 * @param {Readonly<object>} targets Gold, silver, and bronze millisecond targets.
 * @returns {string|null} Medal tier or null when no target was reached.
 */
function resolveMedal(elapsedMs, targets) {
	if (elapsedMs <= targets.gold) {
		return 'gold';
	}
	if (elapsedMs <= targets.silver) {
		return 'silver';
	}
	if (elapsedMs <= targets.bronze) {
		return 'bronze';
	}
	return null;
}

/**
 * @description Verifies scoring is requested only for a matching finished run.
 * @param {Readonly<object>} state Candidate run state.
 * @param {Readonly<object>} definition Candidate definition.
 * @returns {void}
 */
function assertFinishedRun(state, definition) {
	if (state?.status !== 'finished') {
		throw new TypeError('Only finished obstacle-course runs can be scored.');
	}
	if (state.activityId !== definition?.activityId || state.courseId !== definition?.courseId) {
		throw new TypeError('Finished run does not match the activity definition.');
	}
	if (!Number.isFinite(state.startedAtMs) || !Number.isFinite(state.finishedAtMs)) {
		throw new TypeError('Finished run requires finite start and finish times.');
	}
}
