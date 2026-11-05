//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseLifecycle.test.js
 * @description
 * Proves obstacle-course lifecycle, ordering, recovery, and retry identity laws.
 * The Awtsmoos gives every gate its appointed turn; Awtsmoos.com lets tests reveal
 * whether traversal truth advances by covenant rather than by accidental concern.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	applyObstacleCourseRunCommand,
	createObstacleCourseRunState
} from '../../src/gameplay/activities/obstacleCourse/index.js';
import {
	createActiveTestRun,
	createTestActivityDefinition
} from './ObstacleCourseTestFixture.js';

/** @description Proves checkpoint order derives from semantic Core sequence rather than array order. */
function checkpointOrderingTest() {
	const definition = createTestActivityDefinition();
	assert.deepEqual(definition.checkpointIds, [
		'checkpoint-1',
		'checkpoint-2',
		'checkpoint-3'
	]);
}

/** @description Proves countdown, active transition, and numeric timestamps obey lifecycle law. */
function countdownLifecycleTest() {
	const definition = createTestActivityDefinition();
	let state = createObstacleCourseRunState(definition, {
		createdAtMs: 100,
		runSeriesId: 'player-a:session-7'
	});
	state = applyObstacleCourseRunCommand(state, definition, { type: 'discover', atMs: '200' }).state;
	assert.equal(state.status, 'discovered');
	assert.equal(state.discoveredAtMs, 200);
	state = applyObstacleCourseRunCommand(state, definition, { type: 'preview', atMs: 300 }).state;
	state = applyObstacleCourseRunCommand(state, definition, { type: 'countdown', atMs: 400 }).state;
	const earlyStart = applyObstacleCourseRunCommand(state, definition, { type: 'start', atMs: 1399 });
	assert.equal(earlyStart.accepted, false);
	assert.equal(earlyStart.reason, 'countdown-not-complete');
	state = applyObstacleCourseRunCommand(state, definition, { type: 'start', atMs: 1400 }).state;
	assert.equal(state.status, 'active');
	assert.equal(state.startedAtMs, 1400);
}

/** @description Proves out-of-order claims fail while faults retain the last earned recovery point. */
function checkpointAndFaultTest() {
	const definition = createTestActivityDefinition();
	let state = createActiveTestRun(definition);
	const rejected = applyObstacleCourseRunCommand(state, definition, {
		atMs: 1500,
		checkpointId: 'checkpoint-2',
		type: 'checkpoint'
	});
	assert.equal(rejected.reason, 'checkpoint-out-of-order');
	state = applyObstacleCourseRunCommand(state, definition, {
		atMs: 1600,
		checkpointId: 'checkpoint-1',
		type: 'checkpoint'
	}).state;
	const fault = applyObstacleCourseRunCommand(state, definition, { type: 'fault', atMs: 1700 });
	assert.equal(fault.state.faults, 1);
	assert.equal(fault.metadata.recoveryCheckpointId, 'checkpoint-1');
	const prematureFinish = applyObstacleCourseRunCommand(fault.state, definition, { type: 'finish', atMs: 1800 });
	assert.equal(prematureFinish.reason, 'checkpoints-incomplete');
}

/** @description Proves retry increments attempt while preserving caller-owned run-series identity. */
function retryIdentityTest() {
	const definition = createTestActivityDefinition();
	const activeRun = createActiveTestRun(definition, 'player-z:shared-race-4');
	const retry = applyObstacleCourseRunCommand(activeRun, definition, { type: 'retry', atMs: 9000 });
	assert.equal(retry.accepted, true);
	assert.equal(retry.state.attempt, 2);
	assert.equal(retry.state.runSeriesId, 'player-z:shared-race-4');
	assert.equal(retry.state.runId, 'player-z:shared-race-4:attempt:2');
	assert.equal(retry.state.status, 'hidden');
}

test('checkpoint ordering follows Core sequence', checkpointOrderingTest);
test('countdown lifecycle requires maturity', countdownLifecycleTest);
test('checkpoint faults preserve recovery truth', checkpointAndFaultTest);
test('retry preserves run-series identity', retryIdentityTest);
