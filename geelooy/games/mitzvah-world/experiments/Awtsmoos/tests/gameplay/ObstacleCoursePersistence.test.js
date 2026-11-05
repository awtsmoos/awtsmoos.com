//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCoursePersistence.test.js
 * @description
 * Proves scoring, reconstruction, and AdventureStore bridge receipts for finished runs.
 * The Awtsmoos joins memory to motion without confusing either domain; Awtsmoos.com
 * lets one finished race become durable truth and a mission event both clear and sound.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	applyObstacleCourseRunCommand,
	createObstacleCourseAdventureEvent,
	reconstructObstacleCourseRun,
	scoreObstacleCourseRun,
	serializeObstacleCourseRun
} from '../../src/gameplay/activities/obstacleCourse/index.js';
import {
	createActiveTestRun,
	createTestActivityDefinition,
	finishTestRun
} from './ObstacleCourseTestFixture.js';

/** @description Proves clean fast runs receive deterministic medal, score, and reward truth. */
function cleanRunScoringTest() {
	const definition = createTestActivityDefinition();
	const finished = finishTestRun(definition, createActiveTestRun(definition), 5400);
	const score = scoreObstacleCourseRun(finished, definition);
	assert.equal(score.elapsedMs, 4000);
	assert.equal(score.medal, 'gold');
	assert.equal(score.cleanRun, true);
	assert.equal(score.cleanRunBonus, 5000);
	assert.deepEqual(score.reward, { mitzvahPoints: 25 });
}

/** @description Proves one recorded fault removes clean-run bonus while preserving finish scoring. */
function faultScoringTest() {
	const definition = createTestActivityDefinition();
	let activeRun = createActiveTestRun(definition);
	activeRun = applyObstacleCourseRunCommand(activeRun, definition, {
		atMs: 1500,
		type: 'fault'
	}).state;
	const finished = finishTestRun(definition, activeRun, 6400);
	const score = scoreObstacleCourseRun(finished, definition);
	assert.equal(score.cleanRun, false);
	assert.equal(score.cleanRunBonus, 0);
	assert.equal(score.medal, 'gold');
}

/** @description Proves serialized run truth reconstructs exactly and rejects foreign definitions. */
function serializationTest() {
	const definition = createTestActivityDefinition();
	const finished = finishTestRun(definition, createActiveTestRun(definition));
	const serialized = serializeObstacleCourseRun(finished);
	const reconstructed = reconstructObstacleCourseRun(serialized, definition);
	assert.deepEqual(reconstructed, finished);
	assert.equal(Object.isFrozen(reconstructed), true);
	assert.throws(() => reconstructObstacleCourseRun(serialized, {
		...definition,
		courseId: 'foreign-course'
	}), /different obstacle-course activity/);
}

/** @description Proves course completion becomes the exact generic activity event mission progress expects. */
function adventureBridgeTest() {
	const definition = createTestActivityDefinition();
	const finished = finishTestRun(definition, createActiveTestRun(definition));
	const score = scoreObstacleCourseRun(finished, definition);
	const event = createObstacleCourseAdventureEvent(finished, definition, score);
	assert.equal(event.type, 'activity');
	assert.equal(event.target, 'orchard-river-run');
	assert.equal(event.count, 1);
	assert.equal(event.metadata.runId, finished.runId);
	assert.equal(event.metadata.medal, 'gold');
}

test('clean run scoring is deterministic', cleanRunScoringTest);
test('faulted run loses clean-run bonus', faultScoringTest);
test('run serialization reconstructs safely', serializationTest);
test('finished run emits adventure activity event', adventureBridgeTest);
