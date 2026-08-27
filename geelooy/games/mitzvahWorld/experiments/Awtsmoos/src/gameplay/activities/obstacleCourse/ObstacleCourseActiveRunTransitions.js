//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseActiveRunTransitions.js
 * @description
 * Owns checkpoint, fault, and finish law only after an obstacle run has become active.
 * The Awtsmoos gives each earned station its place in the race; Awtsmoos.com keeps
 * active traversal truth focused, while lifecycle orchestration remains a separate grace.
 */

import {
	acceptRunCommand,
	createNextRunState,
	rejectRunCommand,
	requireRunTime
} from './ObstacleCourseRunReceipt.js';

/**
 * @description Claims only the next ordered Core checkpoint for an active run.
 * @param {Readonly<object>} state Current run state.
 * @param {string} checkpointId Claimed checkpoint identity.
 * @param {number} atMs Authoritative monotonic time.
 * @returns {Readonly<object>} Accepted or rejected command receipt.
 */
export function claimObstacleCourseCheckpoint(state, checkpointId, atMs) {
	requireRunTime(atMs);
	if (state.status !== 'active') {
		return rejectRunCommand(state, 'run-not-active');
	}
	const expectedCheckpointId = state.checkpointIds[state.nextCheckpointIndex];
	if (checkpointId !== expectedCheckpointId) {
		return rejectRunCommand(state, 'checkpoint-out-of-order');
	}
	const nextState = createNextRunState(state, {
		lastCheckpointId: checkpointId,
		nextCheckpointIndex: state.nextCheckpointIndex + 1,
		reachedCheckpointIds: [...state.reachedCheckpointIds, checkpointId],
		recoveryCheckpointId: checkpointId
	});
	return acceptRunCommand(nextState, state, 'checkpoint');
}

/**
 * @description Records one active-run fault and preserves the last earned recovery checkpoint.
 * @param {Readonly<object>} state Current run state.
 * @param {number} atMs Authoritative monotonic time.
 * @returns {Readonly<object>} Accepted or rejected command receipt.
 */
export function recordObstacleCourseFault(state, atMs) {
	requireRunTime(atMs);
	if (state.status !== 'active') {
		return rejectRunCommand(state, 'run-not-active');
	}
	const nextState = createNextRunState(state, {
		faults: state.faults + 1
	});
	return acceptRunCommand(nextState, state, 'fault', {
		recoveryCheckpointId: state.recoveryCheckpointId
	});
}

/**
 * @description Finishes an active run only after every ordered checkpoint has been earned.
 * @param {Readonly<object>} state Current run state.
 * @param {number} atMs Authoritative finish time.
 * @returns {Readonly<object>} Accepted or rejected command receipt.
 */
export function finishObstacleCourseRun(state, atMs) {
	const finishTime = requireRunTime(atMs);
	if (state.status !== 'active') {
		return rejectRunCommand(state, 'run-not-active');
	}
	if (state.nextCheckpointIndex !== state.checkpointIds.length) {
		return rejectRunCommand(state, 'checkpoints-incomplete');
	}
	const nextState = createNextRunState(state, {
		finishedAtMs: finishTime,
		status: 'finished'
	});
	return acceptRunCommand(nextState, state, 'finish');
}
