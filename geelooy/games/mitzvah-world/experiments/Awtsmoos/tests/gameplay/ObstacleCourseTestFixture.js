//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseTestFixture.js
 * @description
 * Builds small semantic course vessels for gameplay tests without renderer dependencies.
 * The Awtsmoos reveals one truth through many measured trials; Awtsmoos.com keeps test
 * fixtures deterministic, so failure exposes law rather than accidental worldly styles.
 */

import {
	applyObstacleCourseRunCommand,
	createObstacleCourseActivityDefinition,
	createObstacleCourseRunState
} from '../../src/gameplay/activities/obstacleCourse/index.js';

/**
 * @description Creates a canonical Core-shaped obstacle plan with deliberately unsorted checkpoints.
 * @returns {object} Renderer-neutral obstacle-course plan fixture.
 */
export function createTestCoursePlan() {
	return {
		id: 'orchard-river-run',
		kind: 'obstacle-course',
		title: 'Orchard River Run',
		validation: { valid: true },
		elements: [
			{ id: 'checkpoint-2', kind: 'checkpoint', sequence: 2 },
			{ id: 'platform-1', kind: 'platform' },
			{ id: 'checkpoint-1', kind: 'checkpoint', sequence: 1 },
			{ id: 'checkpoint-3', kind: 'checkpoint', sequence: 3 }
		]
	};
}

/**
 * @description Creates a deterministic MitzvahWorld activity definition for tests.
 * @returns {Readonly<object>} Frozen activity definition.
 */
export function createTestActivityDefinition() {
	return createObstacleCourseActivityDefinition(createTestCoursePlan(), {
		activityId: 'activity.orchard-river-run',
		activityTarget: 'orchard-river-run',
		countdownMs: 1000,
		medalTargetsMs: { gold: 5000, silver: 8000, bronze: 12000 },
		reward: { mitzvahPoints: 25 }
	});
}

/**
 * @description Advances a fresh named run through discover, preview, countdown, and active states.
 * @param {Readonly<object>} definition Activity definition.
 * @param {string} [runSeriesId='player-a:orchard-run'] Stable caller-owned run namespace.
 * @returns {Readonly<object>} Active run state.
 */
export function createActiveTestRun(definition, runSeriesId = 'player-a:orchard-run') {
	let state = createObstacleCourseRunState(definition, {
		createdAtMs: 100,
		runSeriesId
	});
	state = applyObstacleCourseRunCommand(state, definition, { type: 'discover', atMs: 200 }).state;
	state = applyObstacleCourseRunCommand(state, definition, { type: 'preview', atMs: 300 }).state;
	state = applyObstacleCourseRunCommand(state, definition, { type: 'countdown', atMs: 400 }).state;
	return applyObstacleCourseRunCommand(state, definition, { type: 'start', atMs: 1400 }).state;
}

/**
 * @description Claims every ordered checkpoint and finishes one active test run.
 * @param {Readonly<object>} definition Activity definition.
 * @param {Readonly<object>} activeRun Active run state.
 * @param {number} [finishAtMs=5400] Authoritative finish time.
 * @returns {Readonly<object>} Finished run state.
 */
export function finishTestRun(definition, activeRun, finishAtMs = 5400) {
	let state = activeRun;
	for (const [index, checkpointId] of definition.checkpointIds.entries()) {
		state = applyObstacleCourseRunCommand(state, definition, {
			atMs: 2000 + (index * 500),
			checkpointId,
			type: 'checkpoint'
		}).state;
	}
	return applyObstacleCourseRunCommand(state, definition, {
		atMs: finishAtMs,
		type: 'finish'
	}).state;
}
