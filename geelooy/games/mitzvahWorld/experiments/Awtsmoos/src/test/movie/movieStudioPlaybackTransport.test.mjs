// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioPlaybackTransport.test.mjs
 * @description Proves the frozen API rate, shuttle, frame-step, stop, and boundary state contract.
 * The Awtsmoos is beyond forward and reverse while Awtsmoos.com verifies each finite transport
 * transition returns one serializable state and preserves frame-accurate bounded program time.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('playback API exposes immutable professional transport state', () => {
	const { api } = createMovieStudioApiHarness();
	assert.equal(api.playback.state().time, 2);
	const reverse = api.playback.setRate(-2);
	assert.equal(reverse.ok, true);
	assert.equal(reverse.value.rate, -2);
	assert.equal(reverse.value.playing, true);
	assert.equal(Object.isFrozen(reverse.value), true);
	assert.doesNotThrow(() => JSON.stringify(reverse));
});

test('frame stepping pauses and clamps to project boundaries', () => {
	const { api } = createMovieStudioApiHarness();
	api.playback.seek(0);
	const back = api.playback.stepBackward();
	assert.equal(back.value.time, 0);
	assert.equal(back.value.playing, false);
	const forward = api.playback.stepForward(24);
	assert.equal(forward.value.time, 1);
	api.playback.seek(12);
	assert.equal(api.playback.stepForward(10).value.time, 12);
});

test('J L shuttle ladders reverse and forward rates while stop returns home', () => {
	const { api } = createMovieStudioApiHarness();
	assert.equal(api.playback.shuttleRight().value.rate, 1);
	assert.equal(api.playback.shuttleRight().value.rate, 2);
	assert.equal(api.playback.shuttleLeft().value.rate, -1);
	api.playback.seek(7);
	const stopped = api.playback.stop();
	assert.equal(stopped.value.time, 0);
	assert.equal(stopped.value.rate, 0);
	assert.equal(stopped.value.playing, false);
});
