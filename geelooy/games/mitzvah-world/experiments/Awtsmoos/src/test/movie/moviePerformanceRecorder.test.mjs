// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceRecorder.test.mjs
 * @description Proves recorder phases, normalized cadence, sampling, pause, stop, and clean cancel.
 * The Awtsmoos gives every take a beginning and possible return to nothing; Awtsmoos.com
 * keeps accepted movement serializable while cancelled performance leaves no project-bound rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MoviePerformanceRecorder } from '../../movie/MoviePerformanceRecorder.js';


test('count-in becomes recording, pause resumes, and stop builds a serializable take', async () => {
	const target = targetFixture();
	const events = [];
	const recorder = new MoviePerformanceRecorder({
		audio: audioFixture(),
		emit(type) {
			events.push(type);
		}
	});
	const armed = recorder.arm(target, {
		countIn: 0.2,
		name: 'Acted Walk',
		sampleRate: 25
	});
	assert.equal(armed.options.sampleRate, 30);
	await recorder.countIn();
	recorder.update(0.1);
	assert.equal(recorder.status().phase, 'countdown');
	target.position[2] = -1;
	recorder.update(0.1);
	assert.equal(recorder.status().phase, 'recording');
	recorder.pause();
	assert.equal(recorder.status().phase, 'paused');
	await recorder.start();
	target.position[2] = -2;
	recorder.update(0.1);
	const { take } = await recorder.stop();
	assert.equal(take.name, 'Acted Walk');
	assert.equal(take.sampleRate, 30);
	assert.ok(take.transformSamples.length >= 1);
	assert.doesNotThrow(() => JSON.stringify(take));
	assert.ok(events.includes('performance:started'));
	assert.ok(events.includes('performance:stopped'));
});


test('microphone failure is nonfatal and cancellation clears live evidence', async () => {
	const recorder = new MoviePerformanceRecorder({
		audio: audioFixture({ failStart: true })
	});
	recorder.arm(targetFixture(), { recordAudio: true });
	await recorder.start();
	recorder.update(0.1);
	assert.equal(recorder.status().sampleCount, 1);
	const status = recorder.cancel('director-cancel');
	assert.equal(status.phase, 'cancelled');
	assert.equal(recorder.status().sampleCount, 0);
	assert.equal(recorder.media.error, null);
});


test('arming rejects a missing runtime target and validates punch range', () => {
	const recorder = new MoviePerformanceRecorder({ audio: audioFixture() });
	assert.throws(() => recorder.arm({ model: null }), /NOT_CONTROLLABLE/);
	assert.throws(
		() => recorder.arm(targetFixture(), { inPoint: 5, outPoint: 4 }),
		/PUNCH_RANGE_INVALID/
	);
});

function targetFixture() {
	const fixture = {
		id: 'player',
		model: {},
		modelId: 'player-model',
		name: 'Player Chossid',
		position: [0, 0, 0]
	};
	fixture.currentAnimation = () => fixture.position[2] ? 'walking' : 'standing';
	fixture.grounded = () => true;
	fixture.movementState = () => fixture.position[2] ? 'walk' : 'idle';
	fixture.transformSnapshot = () => ({
		position: [...fixture.position],
		rotation: [0, 0, 0],
		scale: [1, 1, 1]
	});
	return fixture;
}

function audioFixture(options = {}) {
	return {
		cancel() {},
		async start() {
			if (options.failStart) {
				throw new Error('permission denied');
			}
			return { enabled: true };
		},
		async stop() {
			return null;
		}
	};
}
