// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowChunkSimulation.test.js
 * @description Proves meadow sim determinism and mathematical catch-up:
 * N small steps compose to one closed-form advance, and an unloaded chunk
 * revisited after a long gap lands exactly where continuous simulation would.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	advanceMeadowState,
	catchUpMeadowState,
	createMeadowState,
	disturbMeadowState,
	grassTarget,
	hash01,
	moistureBase
} from './MeadowChunkSimulation.js';

const SEED = 0x9e3779b9;

test('initial state starts at seed-derived targets', () => {
	const state = createMeadowState(SEED, 100);
	assert.equal(state.grass, grassTarget(SEED));
	assert.equal(state.moisture, moistureBase(SEED));
	assert.equal(state.growth, 0);
	assert.equal(state.lastSimTime, 100);
});

test('advance composes: split steps equal one full step', () => {
	const start = createMeadowState(SEED, 0);
	const split = advanceMeadowState(advanceMeadowState(start, SEED, 37.5), SEED, 62.5);
	const whole = advanceMeadowState(start, SEED, 100);
	assertStateClose(split, whole, 1e-9);
});

test('catch-up over a long absence equals 200 half-second steps', () => {
	const stepped = createMeadowState(SEED, 0);
	let state = stepped;
	for (let step = 0; step < 200; step += 1) {
		state = advanceMeadowState(state, SEED, 0.5);
	}
	const caughtUp = catchUpMeadowState(createMeadowState(SEED, 0), SEED, 100);
	assertStateClose(state, caughtUp, 1e-9);
});

test('disturbance is bounded and decays back toward zero', () => {
	const start = createMeadowState(SEED, 0);
	const hit = disturbMeadowState(start, 5);
	assert.equal(hit.growth, 1);
	const negative = disturbMeadowState(start, -5);
	assert.equal(negative.growth, -1);
	const decayed = advanceMeadowState(hit, SEED, 600);
	assert.ok(Math.abs(decayed.growth) < 0.01, `growth should decay, got ${decayed.growth}`);
});

test('same seed always yields the same trajectory', () => {
	const first = advanceMeadowState(createMeadowState(SEED, 0), SEED, 123.456);
	const second = advanceMeadowState(createMeadowState(SEED, 0), SEED, 123.456);
	assert.deepEqual(first, second);
});

test('hash01 is stable and spread across [0,1)', () => {
	const values = new Set();
	for (let salt = 0; salt < 50; salt += 1) {
		const value = hash01(SEED, `salt:${salt}`);
		assert.ok(value >= 0 && value < 1, `out of range: ${value}`);
		values.add(Math.round(value * 1e6));
	}
	assert.ok(values.size > 40, 'hash outputs should spread');
	assert.equal(hash01(SEED, 'salt:7'), hash01(SEED, 'salt:7'));
});

function assertStateClose(left, right, tolerance) {
	for (const key of ['grass', 'moisture', 'growth', 'lastSimTime']) {
		const difference = Math.abs(left[key] - right[key]);
		assert.ok(
			difference <= tolerance,
			`${key} diverged: ${left[key]} vs ${right[key]} (Δ=${difference})`
		);
	}
}
