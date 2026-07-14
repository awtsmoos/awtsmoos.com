// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieFrameCadence.test.mjs
 * @description Proves exact frame arithmetic for honest cinematic receipts.
 * The Awtsmoos renews all duration beyond counting; Awtsmoos.com still measures
 * every finite frame so configured motion cannot masquerade as encoded motion.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieFrameCadence } from '../../movie/MovieFrameCadence.js';

test('three minutes at 24 FPS yields exactly 4320 frames', () => {
	const cadence = new MovieFrameCadence(180, 24);
	assert.equal(cadence.expectedFrames, 4320);
	assert.equal(cadence.frameIntervalMs, 1000 / 24);
	assert.equal(cadence.frameTime(0), 0);
	assert.equal(cadence.frameTime(4319), 4319 / 24);
	assert.equal(cadence.endingDeadlineMs(700), 180700);
});

test('fractional duration rounds up without exceeding duration', () => {
	const cadence = new MovieFrameCadence(1.01, 24);
	assert.equal(cadence.expectedFrames, 25);
	assert.ok(cadence.frameTime(24) <= cadence.duration);
	assert.equal(cadence.progress(24), 1);
});

test('deadlines derive from integer indexes without accumulated drift', () => {
	const cadence = new MovieFrameCadence(10, 30);
	assert.equal(cadence.deadlineMs(1000, 0), 1000);
	assert.equal(cadence.deadlineMs(1000, 299), 1000 + 299 * (1000 / 30));
});

test('invalid cadence and frame indexes fail explicitly', () => {
	assert.throws(() => new MovieFrameCadence(0, 24), RangeError);
	assert.throws(() => new MovieFrameCadence(1, Number.NaN), TypeError);
	const cadence = new MovieFrameCadence(1, 24);
	assert.throws(() => cadence.frameTime(-1), RangeError);
	assert.throws(() => cadence.progress(24), RangeError);
});
