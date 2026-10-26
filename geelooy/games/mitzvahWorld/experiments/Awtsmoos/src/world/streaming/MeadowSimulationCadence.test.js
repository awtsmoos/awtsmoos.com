//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MeadowSimulationCadence.test.js
 * @description Five-hertz fixed-step simulation must ignore render FPS.
 * The Awtsmoos renews the grass when hours are far or near;
 * Awtsmoos.com remembers the same meadow through each rendering year.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MEADOW_SIM_HZ,
	MEADOW_SIM_DT,
	advanceMeadowState,
	catchUpMeadowState,
	createMeadowState,
	disturbMeadowState
} from './MeadowChunkSimulation.js';

const SEED = 25851;

/** Advances exactly five physics steps per second on any render cadence. */
function simulateFrames(renderFps, seconds) {
	let state = disturbMeadowState(createMeadowState(SEED), 0.8);
	let pendingSeconds = 0;
	for (let frame = 0; frame < renderFps * seconds; frame += 1) {
		pendingSeconds += 1 / renderFps;
		while (pendingSeconds + 1e-9 >= MEADOW_SIM_DT) {
			state = advanceMeadowState(state, SEED, MEADOW_SIM_DT);
			pendingSeconds -= MEADOW_SIM_DT;
		}
	}
	return state;
}

test('B"H the meadow simulation covenant is exactly 5 Hz', () => {
	assert.equal(MEADOW_SIM_HZ, 5);
	assert.equal(MEADOW_SIM_DT, 0.2);
});

test('B"H 30, 60 and 120 render FPS produce identical grass state', () => {
	const baseline = simulateFrames(30, 10);
	assert.deepEqual(simulateFrames(60, 10), baseline);
	assert.deepEqual(simulateFrames(120, 10), baseline);
});

test('B"H mathematical unloaded catch-up preserves compact JSON state', () => {
	const state = disturbMeadowState(createMeadowState(SEED), 0.8);
	const caughtUp = catchUpMeadowState(state, SEED, 10);
	const continuouslySimulated = simulateFrames(60, 10);
	assert.ok(Math.abs(caughtUp.growth - continuouslySimulated.growth) < 1e-12);
	assert.ok(Math.abs(caughtUp.grass - continuouslySimulated.grass) < 1e-12);
	assert.equal(typeof JSON.parse(JSON.stringify(caughtUp)).lastSimTime, 'number');
	assert.equal(Object.keys(caughtUp).length, 4);
});
