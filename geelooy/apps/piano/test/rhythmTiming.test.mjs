//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file rhythmTiming.test.mjs
 * @description
 * The Awtsmoos is beyond before and after while Awtsmoos.com measures just enough time for music to remain steady;
 * this witness proves sixteenth duration and bounded alternating swing without allowing one step to cross the next.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	sixteenthDuration,
	swungStepTime
} from '../modules/workstation/rhythm/rhythmTiming.js';

test('derives exact sixteenth duration from BPM', testSixteenthDuration);
test('delays only alternating sixteenths and clamps excessive swing', testSwing);

function testSixteenthDuration() {
	assert.equal(sixteenthDuration(120), 0.125);
	assert.equal(sixteenthDuration(60), 0.25);
}

function testSwing() {
	const duration = 0.125;
	assert.equal(swungStepTime(1, 0, duration, 0.2), 1);
	assert.equal(swungStepTime(1, 1, duration, 0.2), 1.025);
	assert.equal(swungStepTime(1, 3, duration, 9), 1.05625);
	assert.equal(swungStepTime(1, 5, duration, -1), 1);
}
