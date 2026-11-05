//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseRunReceipt.js
 * @description
 * Builds immutable obstacle-run revisions and command receipts for transport-neutral authority.
 * The Awtsmoos renews each state while truth leaves a trace; Awtsmoos.com gives every command
 * a clear accepted or rejected vessel, so multiplayer order may later find its proper place.
 */

import { freezeObstacleCourseRunState } from './ObstacleCourseRunState.js';

/**
 * @description Creates the next immutable revision from explicit changes.
 * @param {Readonly<object>} state Current run state.
 * @param {object} changes State changes to apply.
 * @returns {Readonly<object>} Frozen next revision.
 */
export function createNextRunState(state, changes) {
	return freezeObstacleCourseRunState({
		...state,
		...changes,
		revision: state.revision + 1
	});
}

/**
 * @description Creates an accepted command receipt around the new authoritative state.
 * @param {Readonly<object>} state New run state.
 * @param {Readonly<object>} previousState Previous run state.
 * @param {string} commandType Accepted command type.
 * @param {object} [metadata={}] Optional projection metadata.
 * @returns {Readonly<object>} Frozen accepted receipt.
 */
export function acceptRunCommand(state, previousState, commandType, metadata = {}) {
	return Object.freeze({
		accepted: true,
		commandType,
		metadata: Object.freeze({ ...metadata }),
		previousRevision: previousState.revision,
		state
	});
}

/**
 * @description Creates a rejected command receipt without changing authoritative state.
 * @param {Readonly<object>} state Current run state.
 * @param {string} reason Stable rejection reason.
 * @returns {Readonly<object>} Frozen rejection receipt.
 */
export function rejectRunCommand(state, reason) {
	return Object.freeze({
		accepted: false,
		reason,
		state
	});
}

/**
 * @description Verifies state and definition identity before any transition is considered.
 * @param {Readonly<object>} state Current run state.
 * @param {Readonly<object>} definition Activity definition.
 * @returns {void}
 */
export function assertMatchingRun(state, definition) {
	if (!state || state.activityId !== definition?.activityId || state.courseId !== definition?.courseId) {
		throw new TypeError('Run state does not match the obstacle-course activity definition.');
	}
}

/**
 * @description Validates caller-supplied monotonic milliseconds without owning a clock.
 * @param {unknown} value Candidate time.
 * @returns {number} Finite milliseconds.
 */
export function requireRunTime(value) {
	const time = Number(value);
	if (!Number.isFinite(time)) {
		throw new RangeError('Obstacle-course commands require finite atMs.');
	}
	return time;
}
