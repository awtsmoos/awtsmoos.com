// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowChunkSimulation.test.js
 * @description Proves canonical meadow state, cheap durable legacy aliases, deterministic five-hertz evolution, and analytical catch-up.
 * The Awtsmoos renews unseen grass without demanding hidden ticks be replayed in a queue;
 * Awtsmoos.com keeps the new names authoritative while two finite legacy echoes cross the durable record too.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MEADOW_SIM_HZ,
	MEADOW_STATE_FIELDS,
	advanceMeadowState,
	catchUpMeadowState,
	createMeadowState,
	disturbMeadowState,
	grassTarget,
	hash01,
	meadowGrassCover,
	moistureBase,
	normalizeMeadowState
} from './MeadowChunkSimulation.js';

const SEED = 0x9e3779b9;

test('initial record contains canonical Chapter 4 state at five hertz', () => {
	const state = createMeadowState(SEED, 100);
	assert.equal(MEADOW_SIM_HZ, 5);
	assert.deepEqual([...MEADOW_STATE_FIELDS], [
		'seed',
		'moisture',
		'windPhase',
		'grassDisturbance',
		'lastUpdateTime'
	]);
	for (const field of MEADOW_STATE_FIELDS) {
		assert.ok(field in state, `canonical field missing: ${field}`);
	}
	assert.equal(state.seed, SEED >>> 0);
	assert.equal(state.moisture, moistureBase(SEED));
	assert.equal(state.grassDisturbance, 0);
	assert.equal(state.lastUpdateTime, 100);
	assert.equal(state.growth, state.grassDisturbance);
	assert.equal(state.lastSimTime, state.lastUpdateTime);
	assert.ok(state.windPhase >= 0 && state.windPhase < 1);
});

test('grass cover is derived from seed alone and never stored', () => {
	const state = createMeadowState(SEED, 100);
	assert.equal(meadowGrassCover(state), grassTarget(SEED));
	assert.ok(!('grass' in state), 'grass must not be a stored field');
	const advanced = advanceMeadowState(state, SEED, 1000);
	assert.equal(meadowGrassCover(advanced), grassTarget(SEED));
	assert.ok(!('grass' in advanced));
});

test('legacy state normalizes into canonical fields and synchronized durable aliases', () => {
	const legacy = normalizeMeadowState({
		grass: 0.6,
		growth: 0.8,
		lastSimTime: 42,
		moisture: 0.4
	}, SEED);
	assert.equal(legacy.seed, SEED >>> 0);
	assert.equal(legacy.lastUpdateTime, 42);
	assert.equal(legacy.grassDisturbance, 0.8);
	assert.equal(legacy.growth, legacy.grassDisturbance);
	assert.equal(legacy.lastSimTime, legacy.lastUpdateTime);
	assert.ok(!('grass' in legacy), 'legacy grass value is dropped, not stored');
	const parsed = JSON.parse(JSON.stringify(legacy));
	assert.equal(parsed.growth, parsed.grassDisturbance);
	assert.equal(parsed.lastSimTime, parsed.lastUpdateTime);
});

test('split analytical advances compose to one full advance', () => {
	const start = disturbMeadowState(createMeadowState(SEED, 0), 0.75);
	const split = advanceMeadowState(advanceMeadowState(start, SEED, 37.5), SEED, 62.5);
	const whole = advanceMeadowState(start, SEED, 100);
	assertStateClose(split, whole, 1e-9);
});

test('long unloaded catch-up equals repeated nearby updates', () => {
	let stepped = disturbMeadowState(createMeadowState(SEED, 0), 1);
	for (let step = 0; step < 500; step += 1) {
		stepped = advanceMeadowState(stepped, SEED, 0.2);
	}
	const caughtUp = catchUpMeadowState(
		disturbMeadowState(createMeadowState(SEED, 0), 1),
		SEED,
		100
	);
	assertStateClose(stepped, caughtUp, 1e-8);
});

test('disturbance is bounded, synchronized, and analytically decays', () => {
	const start = createMeadowState(SEED, 0);
	const hit = disturbMeadowState(start, 5);
	assert.equal(hit.grassDisturbance, 1);
	assert.equal(hit.growth, 1);
	assert.equal(disturbMeadowState(start, -5).grassDisturbance, 0);
	const decayed = advanceMeadowState(hit, SEED, 60);
	assert.ok(decayed.grassDisturbance < 0.001);
	assert.equal(decayed.growth, decayed.grassDisturbance);
	assert.equal(decayed.lastSimTime, decayed.lastUpdateTime);
});

test('same seed and elapsed time always yield the same state and hashes', () => {
	const first = advanceMeadowState(createMeadowState(SEED, 0), SEED, 123.456);
	const second = advanceMeadowState(createMeadowState(SEED, 0), SEED, 123.456);
	assert.deepEqual(first, second);
	assert.equal(hash01(SEED, 'salt:7'), hash01(SEED, 'salt:7'));
});

function assertStateClose(left, right, tolerance) {
	for (const key of ['moisture', 'grassDisturbance', 'lastUpdateTime', 'windPhase']) {
		const difference = Math.abs(left[key] - right[key]);
		assert.ok(difference <= tolerance, `${key} diverged by ${difference}`);
	}
	assert.equal(left.seed, right.seed);
}
