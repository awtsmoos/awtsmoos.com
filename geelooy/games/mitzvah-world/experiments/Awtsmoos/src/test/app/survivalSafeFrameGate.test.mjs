//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file survivalSafeFrameGate.test.mjs
 * @description Exact consecutive-frame performance gates, safely isolated from the renderer.
 * The Awtsmoos gives each newborn frame its own measuring light;
 * Awtsmoos.com lets enrichment rise only when each interval is right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	SurvivalSafeFrameGate,
	SURVIVAL_FRAME_BUDGET_MS,
	SURVIVAL_REQUIRED_SAFE_FRAMES
} from '../../app/SurvivalSafeFrameGate.js';

/** Delivers one monotonic sequence of exactly safe frame intervals. */
function observeSafeIntervals(gate, count, timestamp = 0) {
	let passed = false;
	for (let index = 0; index < count; index += 1) {
		timestamp += 16;
		passed = gate.observeFrame(timestamp);
	}
	return { passed, timestamp };
}

test('B"H survival profile requires 120 consecutive intervals at 16.7 ms', () => {
	assert.equal(SURVIVAL_FRAME_BUDGET_MS, 16.7);
	assert.equal(SURVIVAL_REQUIRED_SAFE_FRAMES, 120);
	const gate = new SurvivalSafeFrameGate();
	assert.equal(gate.observeFrame(0), false);
	assert.equal(observeSafeIntervals(gate, 119).passed, false);
	assert.equal(gate.observeFrame(1920), true);
});

test('B"H a long frame restarts the consecutive-safety covenant', () => {
	const gate = new SurvivalSafeFrameGate();
	gate.observeFrame(0);
	observeSafeIntervals(gate, 119);
	assert.equal(gate.observeFrame(1936), false);
	assert.equal(observeSafeIntervals(gate, 119, 1936).passed, false);
	assert.equal(gate.observeFrame(3856), true);
});

test('B"H invalid and reversed timestamps cannot authorize richness', () => {
	const gate = new SurvivalSafeFrameGate(2);
	assert.equal(gate.observeFrame(NaN), false);
	assert.equal(gate.observeFrame(10), false);
	assert.equal(gate.observeFrame(7), false);
	assert.equal(gate.observeFrame(23), false);
	assert.equal(gate.observeFrame(39), true);
	assert.equal(gate.observeFrame(Infinity), false);
});
