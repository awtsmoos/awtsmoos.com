// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceApiContract.test.mjs
 * @description Proves recorder preferences, action slots, capabilities, aliases, and immutable API witnesses.
 * The Awtsmoos lets agent and actor share one truthful vessel; Awtsmoos.com keeps
 * every returned setting detached while canonical commands alone may reshape project rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import {
	createMovieStudioApiHarness,
	sampleMovieProject
} from './movieStudioApiHarness.mjs';

function installPerformanceHarness() {
	const harness = createMovieStudioApiHarness();
	harness.session.project = normalizeMovieProject(sampleMovieProject());
	const calls = [];
	harness.session.performanceController = {
		availableActions: () => [{ id: 'wave', label: 'Wave' }],
		characters: () => [{
			controllable: true,
			id: 'player',
			name: 'Player'
		}],
		handleTakeAction: (action, takeId) => {
			calls.push([action, takeId]);
			return { clipId: 'clip-one', takeId };
		},
		input: {
			clearIntent: () => ({ cleared: true }),
			setIntent: intent => intent
		},
		state: { mode: 'performance', selectedCharacterId: 'player' }
	};
	return { ...harness, calls };
}

test('recorder ranges update incrementally and remain frozen snapshots', () => {
	const { api, session } = installPerformanceHarness();
	const first = api.performance.setRecorderRanges({
		activeLoop: 2,
		loopCount: 3,
		metronome: true,
		preRoll: 1.5,
		punchIn: 4,
		punchOut: 6
	});
	assert.equal(first.loopCount, 3);
	assert.equal(Object.isFrozen(first), true);
	const second = api.performance.setRecorderRanges({ postRoll: 2 });
	assert.equal(second.loopCount, 3);
	assert.equal(second.postRoll, 2);
	assert.equal(session.project.performance.preferences.punchOut, 6);
	assert.throws(() => { second.loopCount = 99; }, TypeError);
	assert.doesNotThrow(() => JSON.stringify(second));
});

test('action slots, aliases, and explicit capability limits are JSON safe', () => {
	const { api, calls } = installPerformanceHarness();
	const assignments = api.performance.setActionAssignments(['wave']);
	assert.equal(assignments.actionAssignments.length, 9);
	assert.equal(assignments.actionAssignments[0], 'wave');
	assert.equal(api.performance.mode(), 'performance');
	assert.equal(api.performance.currentCharacter().id, 'player');
	assert.equal(api.performance.listActions()[0].id, 'wave');
	assert.equal(api.performance.capabilities().cameraCollision.supported, false);
	const audition = api.performance.auditionTake('take-one');
	assert.deepEqual(calls, [['audition', 'take-one']]);
	assert.deepEqual(audition, { clipId: 'clip-one', takeId: 'take-one' });
	assert.equal(Object.isFrozen(audition), true);
});
