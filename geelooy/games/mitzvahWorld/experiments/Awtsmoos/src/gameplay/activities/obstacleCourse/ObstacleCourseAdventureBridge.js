//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseAdventureBridge.js
 * @description
 * Converts certified obstacle-course completion into the existing AdventureStore event language.
 * The Awtsmoos joins distinct vessels without erasing their role; Awtsmoos.com lets a course
 * remain its own replayable activity while a mission hears completion through one narrow whole.
 */

/**
 * @description Creates the canonical adventure progress event for one finished course run.
 * @param {Readonly<object>} state Finished obstacle-course run state.
 * @param {Readonly<object>} definition Matching activity definition.
 * @param {Readonly<object>} scoreReceipt Deterministic score receipt for diagnostics/rewards.
 * @returns {Readonly<object>} Frozen AdventureStore-compatible event.
 */
export function createObstacleCourseAdventureEvent(state, definition, scoreReceipt) {
	assertCompletion(state, definition, scoreReceipt);
	return Object.freeze({
		count: 1,
		metadata: Object.freeze({
			attempt: state.attempt,
			cleanRun: scoreReceipt.cleanRun,
			courseId: definition.courseId,
			elapsedMs: scoreReceipt.elapsedMs,
			medal: scoreReceipt.medal,
			runId: state.runId,
			score: scoreReceipt.score,
			systemVersion: 1
		}),
		target: definition.activityTarget,
		type: 'activity'
	});
}

/**
 * @description Guards the bridge so only matching finished/scored truth can advance adventures.
 * @param {Readonly<object>} state Candidate run state.
 * @param {Readonly<object>} definition Candidate activity definition.
 * @param {Readonly<object>} scoreReceipt Candidate score receipt.
 * @returns {void}
 */
function assertCompletion(state, definition, scoreReceipt) {
	if (state?.status !== 'finished') {
		throw new TypeError('Adventure progress requires a finished obstacle-course run.');
	}
	if (state.activityId !== definition?.activityId || state.courseId !== definition?.courseId) {
		throw new TypeError('Obstacle-course run does not match the activity definition.');
	}
	if (scoreReceipt?.runId !== state.runId || scoreReceipt?.courseId !== state.courseId) {
		throw new TypeError('Obstacle-course score receipt does not match the finished run.');
	}
}
