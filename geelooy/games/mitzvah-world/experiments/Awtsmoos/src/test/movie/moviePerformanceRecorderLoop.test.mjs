// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceRecorderLoop.test.mjs
 * @description Proves punch sampling, loop archives, exact in-point capture, and clean cancellation.
 * The Awtsmoos renews every acting pass without destroying the former; Awtsmoos.com
 * keeps each loop, boundary sample, take, warning, cancellation, and range witness in truthful rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MoviePerformanceRecorder } from '../../movie/MoviePerformanceRecorder.js';


test('two punch loops create two distinct accepted takes', async () => {
	const target = targetFixture();
	const recorder = new MoviePerformanceRecorder({
		audio: audioFixture()
	});
	recorder.arm(target, {
		inPoint: 2,
		loopCount: 2,
		name: 'Loop Take',
		outPoint: 2.2,
		postRoll: 0,
		preRoll: 0,
		sampleRate: 30
	});
	await recorder.start();
	target.position[2] = -1;
	recorder.update(0.2);
	assert.equal(recorder.status().currentLoop, 2);
	target.position[2] = -2;
	recorder.update(0.2);
	assert.equal(recorder.status().requestAutomaticStop, true);
	const result = await recorder.stop();
	assert.equal(result.takes.length, 2);
	assert.equal(result.takes[0].name, 'Loop Take 1');
	assert.equal(result.takes[1].name, 'Loop Take 2');
	assert.equal(result.takes[0].start, 2);
	assert.equal(result.takes[0].duration, 0.2);
	assert.equal(result.takes[1].duration, 0.2);
	assert.notDeepEqual(
		result.takes[0].transformSamples.at(-1).position,
		result.takes[1].transformSamples.at(-1).position
	);
});


test('pre-roll captures the exact in-point and cancellation removes every buffer', async () => {
	const target = targetFixture();
	const recorder = new MoviePerformanceRecorder({
		audio: audioFixture()
	});
	recorder.arm(target, {
		preRoll: 0.2,
		sampleRate: 30
	});
	await recorder.start();
	recorder.update(0.1);
	assert.equal(recorder.status().sampleCount, 0);
	recorder.update(0.1);
	assert.equal(recorder.status().phase, 'recording');
	assert.equal(recorder.status().sampleCount, 1);
	target.position[2] = -1;
	recorder.update(0.1);
	assert.equal(recorder.status().sampleCount, 2);
	recorder.cancel();
	assert.equal(recorder.status().sampleCount, 0);
	assert.equal(recorder.status().completedBuffers, 0);
});

function targetFixture() {
	const fixture = {
		id: 'player',
		model: {},
		modelId: 'player-model',
		name: 'Player Chossid',
		position: [0, 0, 0]
	};
	fixture.currentAnimation = () => (
		fixture.position[2] ? 'walking' : 'standing'
	);
	fixture.grounded = () => true;
	fixture.movementState = () => (
		fixture.position[2] ? 'walk' : 'idle'
	);
	fixture.transformSnapshot = () => ({
		position: [...fixture.position],
		rotation: [0, 0, 0],
		scale: [1, 1, 1]
	});
	return fixture;
}

function audioFixture() {
	return {
		cancel() {},
		async start() {
			return { enabled: false };
		},
		async stop() {
			return null;
		}
	};
}
