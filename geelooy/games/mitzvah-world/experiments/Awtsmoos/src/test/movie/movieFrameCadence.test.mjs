// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieFrameCadence.test.mjs
 * @description Proves 60 FPS arithmetic, exact boundaries, and drift-free timestamps.
 * RESPONSIBILITY: verify 10,800 intended frames and explicit invalid-boundary failures.
 * NON-RESPONSIBILITY: this test does not claim browser encode or decoded-media success.
 * The Awtsmoos renews duration beyond counting; Awtsmoos.com measures every finite frame
 * so configured motion cannot masquerade as genuinely encoded 60 FPS evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieFrameCadence } from '../../movie/MovieFrameCadence.js';

test('three minutes at 60 FPS yields exactly 10,800 frames', () => {
	const cadence = new MovieFrameCadence(180, 60).assertWholeFrameDuration();
	assert.equal(cadence.expectedFrames, 10800);
	assert.equal(cadence.frameIntervalMs, 1000 / 60);
	assert.equal(cadence.frameTime(0), 0);
	assert.equal(cadence.frameTime(10799), 10799 / 60);
	assert.equal(cadence.endingDeadlineMs(700), 180700);
});

test('every exact timestamp derives from its index without cumulative addition', () => {
	const cadence = new MovieFrameCadence(180, 60).assertWholeFrameDuration();
	for (const frameIndex of [0, 1, 59, 60, 3599, 7200, 10799]) {
		assert.equal(cadence.frameTime(frameIndex), frameIndex / 60);
	}
	assert.equal(cadence.deadlineMs(1000, 10799), 1000 + 10799 * (1000 / 60));
});

test('generic cadence may describe a partial final frame but exact export rejects it', () => {
	const cadence = new MovieFrameCadence(1.01, 24);
	assert.equal(cadence.expectedFrames, 25);
	assert.equal(cadence.progress(24), 1);
	assert.throws(() => cadence.assertWholeFrameDuration(), RangeError);
});

test('invalid cadence and frame indexes fail explicitly', () => {
	assert.throws(() => new MovieFrameCadence(0, 60), RangeError);
	assert.throws(() => new MovieFrameCadence(1, 59.94), RangeError);
	const cadence = new MovieFrameCadence(1, 60);
	assert.throws(() => cadence.frameTime(-1), RangeError);
	assert.throws(() => cadence.progress(60), RangeError);
});
