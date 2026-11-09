// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldWindState.test.js
 * @description Proves the shared wind state is one small seed-plus-phase object,
 * advances with the same law as per-chunk meadow wind, catches up analytically,
 * and gives the grass system a deterministic sway vector.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	advanceMitzvahWorldWindState,
	catchUpMitzvahWorldWindState,
	createMitzvahWorldWindState,
	mitzvahWorldWindPhaseAt,
	mitzvahWorldWindSwayAt,
	normalizeWindState
} from './MitzvahWorldWindState.js';
import {
	createMeadowState,
	advanceMeadowState
} from './MeadowChunkSimulation.js';

const SEED = 0x9e3779b9;

test('shared wind state stores only seed and wind phase', () => {
	const state = createMitzvahWorldWindState(SEED, 10);
	assert.deepEqual(Object.keys(state).sort(), ['seed', 'windPhase']);
	assert.equal(state.seed, SEED >>> 0);
	assert.ok(state.windPhase >= 0 && state.windPhase < 1);
	assert.ok(Object.isFrozen(state));
});

test('same seed and time always reproduce the same wind state', () => {
	const first = createMitzvahWorldWindState(SEED, 123.456);
	const second = createMitzvahWorldWindState(SEED, 123.456);
	assert.deepEqual(first, second);
	assert.equal(
		mitzvahWorldWindPhaseAt(SEED, 77.5),
		mitzvahWorldWindPhaseAt(SEED, 77.5)
	);
});

test('shared wind phase agrees with per-chunk meadow wind phase', () => {
	const wind = createMitzvahWorldWindState(SEED, 0);
	const meadow = createMeadowState(SEED, 0);
	assert.equal(wind.windPhase, meadow.windPhase);
	const advancedWind = advanceMitzvahWorldWindState(wind, 100);
	const advancedMeadow = advanceMeadowState(meadow, SEED, 100);
	assert.ok(
		Math.abs(advancedWind.windPhase - advancedMeadow.windPhase) < 1e-12,
		`shared ${advancedWind.windPhase} vs meadow ${advancedMeadow.windPhase}`
	);
});

test('split advances compose to one full advance', () => {
	const start = createMitzvahWorldWindState(SEED, 0);
	const split = advanceMitzvahWorldWindState(
		advanceMitzvahWorldWindState(start, 37.5),
		62.5
	);
	const whole = advanceMitzvahWorldWindState(start, 100);
	assert.ok(Math.abs(split.windPhase - whole.windPhase) < 1e-12);
});

test('catch-up to absolute time equals continuous advance (no replay)', () => {
	const start = createMitzvahWorldWindState(SEED, 0);
	const caughtUp = catchUpMitzvahWorldWindState(start, 3600);
	const advanced = advanceMitzvahWorldWindState(start, 3600);
	assert.ok(Math.abs(caughtUp.windPhase - advanced.windPhase) < 1e-12);
	assert.deepEqual(caughtUp, createMitzvahWorldWindState(SEED, 3600));
});

test('sway vector is deterministic, bounded, and moves with the phase', () => {
	const state = createMitzvahWorldWindState(SEED, 0);
	const first = mitzvahWorldWindSwayAt(state, 12, -8, 5);
	const second = mitzvahWorldWindSwayAt(state, 12, -8, 5);
	assert.deepEqual(first, second);
	assert.ok(Math.abs(first.swayX) <= 1 && Math.abs(first.swayZ) <= 1);
	const later = mitzvahWorldWindSwayAt(state, 12, -8, 500);
	assert.ok(
		Math.abs(later.swayX - first.swayX) > 1e-6
			|| Math.abs(later.swayZ - first.swayZ) > 1e-6,
		'sway should change over time'
	);
});

test('normalizing a partial record restores the canonical two fields', () => {
	const normalized = normalizeWindState({ seed: SEED });
	assert.deepEqual(Object.keys(normalized).sort(), ['seed', 'windPhase']);
	assert.equal(normalized.seed, SEED >>> 0);
	assert.equal(
		normalized.windPhase,
		mitzvahWorldWindPhaseAt(SEED, 0)
	);
});
