//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseRunTransitions.js
 * @description
 * Routes obstacle-course commands into lifecycle and active-run transition vessels.
 * The Awtsmoos is one while finite paths divide by role; Awtsmoos.com keeps this
 * doorway small, so every transition module can guard one coherent gameplay whole.
 */

import {
	claimObstacleCourseCheckpoint,
	finishObstacleCourseRun,
	recordObstacleCourseFault
} from './ObstacleCourseActiveRunTransitions.js';
import {
	changeObstacleCourseStatus,
	retryObstacleCourseRun,
	startObstacleCourseRun
} from './ObstacleCourseLifecycleTransitions.js';
import {
	assertMatchingRun,
	rejectRunCommand
} from './ObstacleCourseRunReceipt.js';

/**
 * @description Applies one explicit gameplay command to matching obstacle-course run truth.
 * @param {Readonly<object>} state Current run state.
 * @param {Readonly<object>} definition Matching activity definition.
 * @param {object} command Command containing type and optional atMs/checkpointId.
 * @returns {Readonly<object>} Accepted or rejected transition receipt.
 */
export function applyObstacleCourseRunCommand(state, definition, command = {}) {
	assertMatchingRun(state, definition);
	const commandType = String(command.type ?? '');
	if (commandType === 'discover') {
		return changeObstacleCourseStatus(state, ['hidden'], 'discovered', command.atMs, {
			discoveredAtMs: command.atMs
		});
	}
	if (commandType === 'preview') {
		return changeObstacleCourseStatus(state, ['discovered'], 'preview', command.atMs);
	}
	if (commandType === 'countdown') {
		return changeObstacleCourseStatus(state, ['preview'], 'countdown', command.atMs, {
			countdownStartedAtMs: command.atMs
		});
	}
	if (commandType === 'start') {
		return startObstacleCourseRun(state, definition, command.atMs);
	}
	if (commandType === 'checkpoint') {
		return claimObstacleCourseCheckpoint(state, command.checkpointId, command.atMs);
	}
	if (commandType === 'fault') {
		return recordObstacleCourseFault(state, command.atMs);
	}
	if (commandType === 'finish') {
		return finishObstacleCourseRun(state, command.atMs);
	}
	if (commandType === 'retry') {
		return retryObstacleCourseRun(state, definition, command.atMs);
	}
	return rejectRunCommand(state, 'unknown-command');
}
