//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseRunState.js
 * @description
 * Creates JSON-safe obstacle-run truth without clocks, DOM, renderer, or transport.
 * The Awtsmoos renews each instant while identity remains clear in line; Awtsmoos.com
 * lets local or multiplayer authorities supply a stable namespace for every run design.
 */

export const OBSTACLE_COURSE_RUN_VERSION = 1;

/**
 * @description Creates initial hidden state for one deterministic course attempt.
 * @param {object} definition Frozen MitzvahWorld activity definition.
 * @param {object} [options={}] Attempt identity, namespace, and authoritative creation time.
 * @returns {Readonly<object>} Frozen JSON-safe run state.
 */
export function createObstacleCourseRunState(definition, options = {}) {
	assertActivityDefinition(definition);
	const attempt = positiveAttempt(options.attempt ?? 1);
	const runSeriesId = String(options.runSeriesId ?? definition.activityId);
	const runId = String(options.runId ?? `${runSeriesId}:attempt:${attempt}`);
	return freezeObstacleCourseRunState({
		activityId: definition.activityId,
		attempt,
		checkpointIds: [...definition.checkpointIds],
		countdownStartedAtMs: null,
		courseId: definition.courseId,
		createdAtMs: finiteTime(options.createdAtMs ?? 0, 'createdAtMs'),
		discoveredAtMs: null,
		faults: 0,
		finishedAtMs: null,
		lastCheckpointId: null,
		nextCheckpointIndex: 0,
		reachedCheckpointIds: [],
		recoveryCheckpointId: null,
		revision: 0,
		runId,
		runSeriesId,
		startedAtMs: null,
		status: 'hidden',
		systemVersion: OBSTACLE_COURSE_RUN_VERSION
	});
}

/**
 * @description Freezes copied run collections so callers cannot mutate gameplay truth by reference.
 * @param {object} state Candidate run-state value.
 * @returns {Readonly<object>} Frozen state with frozen checkpoint collections.
 */
export function freezeObstacleCourseRunState(state) {
	return Object.freeze({
		...state,
		checkpointIds: Object.freeze([...(state.checkpointIds ?? [])]),
		reachedCheckpointIds: Object.freeze([...(state.reachedCheckpointIds ?? [])])
	});
}

/**
 * @description Verifies the minimum activity-definition contract required by run truth.
 * @param {object} definition Candidate activity definition.
 * @returns {void}
 */
function assertActivityDefinition(definition) {
	if (!definition?.activityId || !definition?.courseId || !Array.isArray(definition?.checkpointIds)) {
		throw new TypeError('A valid obstacle-course activity definition is required.');
	}
}

/**
 * @description Normalizes a positive integer attempt number.
 * @param {unknown} value Candidate attempt.
 * @returns {number} Positive integer attempt.
 */
function positiveAttempt(value) {
	const attempt = Number(value);
	if (!Number.isInteger(attempt) || attempt < 1) {
		throw new RangeError('attempt must be a positive integer.');
	}
	return attempt;
}

/**
 * @description Validates one caller-supplied authoritative monotonic time value.
 * @param {unknown} value Candidate milliseconds.
 * @param {string} label Error label.
 * @returns {number} Finite millisecond value.
 */
function finiteTime(value, label) {
	const time = Number(value);
	if (!Number.isFinite(time)) {
		throw new RangeError(`${label} must be finite.`);
	}
	return time;
}
