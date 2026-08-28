//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseSerialization.js
 * @description
 * Serializes and reconstructs versioned obstacle-run truth without choosing a storage provider.
 * The Awtsmoos renews reality while identity remains knowable through ordered signs; Awtsmoos.com
 * lets one run cross process boundaries as data, never chained to renderer objects or hidden designs.
 */

import {
	freezeObstacleCourseRunState,
	OBSTACLE_COURSE_RUN_VERSION
} from './ObstacleCourseRunState.js';

/**
 * @description Serializes one run state into stable JSON-ready text.
 * @param {Readonly<object>} state Obstacle-course run state.
 * @returns {string} JSON representation suitable for storage or transport.
 */
export function serializeObstacleCourseRun(state) {
	assertSerializableState(state);
	return JSON.stringify(state);
}

/**
 * @description Reconstructs and validates serialized run truth against the current activity definition.
 * @param {string|object} serialized JSON text or parsed run value.
 * @param {Readonly<object>} definition Current activity definition.
 * @returns {Readonly<object>} Frozen reconstructed run state.
 */
export function reconstructObstacleCourseRun(serialized, definition) {
	const parsed = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
	assertSerializableState(parsed);
	assertDefinitionMatch(parsed, definition);
	return freezeObstacleCourseRunState({ ...parsed });
}

/**
 * @description Verifies the minimum versioned run contract before persistence or reconstruction.
 * @param {object} state Candidate state.
 * @returns {void}
 */
function assertSerializableState(state) {
	if (!state || state.systemVersion !== OBSTACLE_COURSE_RUN_VERSION) {
		throw new TypeError('Unsupported obstacle-course run version.');
	}
	if (!state.runId || !state.activityId || !state.courseId) {
		throw new TypeError('Serialized obstacle-course run identity is incomplete.');
	}
	if (!Array.isArray(state.checkpointIds) || !Array.isArray(state.reachedCheckpointIds)) {
		throw new TypeError('Serialized obstacle-course checkpoint collections are invalid.');
	}
	if (!Number.isInteger(state.revision) || state.revision < 0) {
		throw new TypeError('Serialized obstacle-course revision is invalid.');
	}
}

/**
 * @description Rejects stale or foreign run data that does not match current course identity and checkpoints.
 * @param {object} state Parsed run state.
 * @param {Readonly<object>} definition Current activity definition.
 * @returns {void}
 */
function assertDefinitionMatch(state, definition) {
	if (state.activityId !== definition?.activityId || state.courseId !== definition?.courseId) {
		throw new TypeError('Serialized run belongs to a different obstacle-course activity.');
	}
	const expected = JSON.stringify(definition.checkpointIds);
	const actual = JSON.stringify(state.checkpointIds);
	if (actual !== expected) {
		throw new TypeError('Serialized run checkpoint order no longer matches the activity definition.');
	}
}
