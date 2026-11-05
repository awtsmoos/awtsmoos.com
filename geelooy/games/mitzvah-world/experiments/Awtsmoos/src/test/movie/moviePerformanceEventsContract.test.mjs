// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceEventsContract.test.mjs
 * @description Proves revision envelopes, automatic stop, path identifiers, capability warnings, and schema truth.
 * The Awtsmoos lets every transition become observable without exposing runtime state; Awtsmoos.com
 * keeps revision, stable identity, failure, method discovery, and cinematic completion in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import { createMovieStudioPerformancePathDomain } from '../../movie/MovieStudioApiPerformancePath.js';
import { createMovieStudioPerformancePreferencesDomain } from '../../movie/MovieStudioApiPerformancePreferences.js';
import { movieStudioPerformanceSchema } from '../../movie/MovieStudioApiPerformanceSchema.js';
import { MovieStudioPerformanceController } from '../../movie/MovieStudioPerformanceController.js';
import { updateMovieStudioPerformanceRecording } from '../../movie/MovieStudioPerformanceRecordingFlow.js';
import { createMovieStudioApiHarness, sampleMovieProject } from './movieStudioApiHarness.mjs';
import { performanceTake } from './moviePerformanceFixture.mjs';

test('controller events clone detail and include current revision', () => {
	const events = [];
	const session = {
		events: { emit: (name, detail) => events.push([name, detail]) },
		revision: 17
	};
	const detail = { characterId: 'player', nested: { value: 1 } };
	MovieStudioPerformanceController.prototype.emit.call({ session }, 'performance:armed', detail);
	detail.nested.value = 9;
	assert.deepEqual(events[0], [
		'performance:armed',
		{ characterId: 'player', nested: { value: 1 }, revision: 17 }
	]);
});

test('automatic range completion emits once before asynchronous acceptance', async () => {
	const events = [];
	let statusCalls = 0;
	const statuses = [
		{ phase: 'recording' },
		{ characterId: 'player', currentLoop: 2, phase: 'readyToStop', requestAutomaticStop: true }
	];
	const recording = {
		controller: {
			emit: (name, detail) => events.push([name, detail]),
			recorder: {
				status: () => statuses[Math.min(statusCalls++, 1)],
				update() {}
			}
		},
		pendingAutomaticStop: null,
		stop: async () => ({ accepted: true })
	};
	updateMovieStudioPerformanceRecording(recording, 0.2);
	await recording.pendingAutomaticStop;
	assert.equal(events.length, 1);
	assert.equal(events[0][0], 'performance:automatic-stop');
	assert.equal(events[0][1].loop, 2);
});

test('path edits and unsupported camera collision publish stable evidence', () => {
	const harness = createMovieStudioApiHarness();
	harness.session.project = normalizeMovieProject(sampleMovieProject());
	harness.session.project.performance.takes = [performanceTake({ id: 'path-take' })];
	harness.session.performanceController = { state: { mode: 'performance' } };
	const received = [];
	harness.session.events.on('performance:path-changed', event => received.push(event.detail));
	harness.session.events.on('performance:missing-capability', event => received.push(event.detail));
	createMovieStudioPerformancePathDomain(harness.session).movePoint('path-take', {
		index: 0,
		position: [2, 0, 3]
	});
	const preferences = createMovieStudioPerformancePreferencesDomain(harness.session);
	const result = preferences.setPreferences({ camera: { collisionAvoidance: true } });
	assert.equal(received[0].takeId, 'path-take');
	assert.equal(received[0].operation, 'movePoint');
	assert.equal(typeof received[0].revision, 'number');
	assert.equal(received[1].code, 'PERFORMANCE_CAMERA_COLLISION_UNSUPPORTED');
	assert.equal(result.camera.collisionAvoidance, false);
});

test('schema advertises implemented event and method contracts', () => {
	const schema = movieStudioPerformanceSchema();
	assert.equal(Object.isFrozen(schema), true);
	assert.equal(schema.resultContract.runtimeObjects, false);
	assert.ok(schema.events.includes('performance:audio-device-loss-failure'));
	assert.ok(schema.events.includes('performance:automatic-stop'));
	assert.ok(schema.events.includes('performance:path-changed'));
	assert.ok(schema.methods.control.includes('retake'));
	assert.ok(schema.methods.preferences.includes('setRecorderRanges'));
	assert.ok(schema.methods.takes.includes('favoriteTake'));
});
