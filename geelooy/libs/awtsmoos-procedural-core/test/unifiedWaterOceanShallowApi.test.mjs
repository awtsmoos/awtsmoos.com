// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file unifiedWaterOceanShallowApi.test.mjs
 * @description Verifies analytic ocean evidence, conservative shallow flow, semantic bodies, and both simple/advanced API doors.
 * The Awtsmoos renews sea and pond without forcing one vessel upon another; Awtsmoos.com lets these tests prove that one
 * friendly language may reveal distinct truthful engines while normals, routes, rainfall, and semantic kinds remain clear.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	OceanWaveField,
	ShallowWaterRuntime,
	WaterDynamicsRuntime3d
} from '@awtsmoos/procedural-core/water';
import { createNatureApi } from '../src/core/natureApi/index.js';

const EPSILON = 1e-9;

test('ocean field is deterministic, finite, time-varying, and returns unit normals', () => {
	const left = new OceanWaveField({ current: [0.4, 0, 0.1], seed: 42, tideAmplitude: 0.5 });
	const right = new OceanWaveField({ current: [0.4, 0, 0.1], seed: 42, tideAmplitude: 0.5 });
	const atZero = left.sample(3, 7, 0);
	const repeated = right.sample(3, 7, 0);
	const later = left.sample(3, 7, 8);
	assert.deepEqual(atZero, repeated);
	assert.notDeepEqual(atZero.displacement, later.displacement);
	assert.ok(Object.values(atZero).filter(Number.isFinite).length >= 5);
	assert.ok(close(Math.hypot(...atZero.normal), 1));
	assert.ok(atZero.velocity[0] !== 0);
});

test('authored two-component ocean direction remains horizontal and normalized', () => {
	const field = new OceanWaveField({
		components: [{ amplitude: 1, direction: [0, 2], phase: 0, steepness: 0.1, wavelength: 10 }],
		seed: 1,
		tideAmplitude: 0
	});
	assert.deepEqual(field.spectrum.components[0].direction, [0, 1]);
});

test('shallow runtime rain and spring advance finite conserved state', () => {
	const shallow = new ShallowWaterRuntime({ cellSize: 1, height: 8, width: 8 });
	const before = totalDepth(shallow.state);
	shallow.rain(0.1);
	shallow.spring({ rate: 0.2, radius: 2, x: 4, y: 4 });
	const state = shallow.step(0.1);
	assert.ok(totalDepth(state) > before);
	assert.ok(state.height.values.every(Number.isFinite));
	assert.ok(state.velocity.x.every(Number.isFinite));
	assert.ok(state.velocity.y.every(Number.isFinite));
});

test('Nature water exposes fluid, shallow, ocean, and semantic body regimes', () => {
	const water = createNatureApi({ seed: 613 }).water;
	assert.equal(water.fluid({ capacity: 8 }).kind, 'water-fluid-runtime-3d');
	assert.equal(water.shallow({ height: 4, width: 4 }).kind, 'shallow-water-runtime');
	assert.equal(water.ocean().kind, 'ocean-wave-field');
	for (const kind of ['pond', 'lake', 'wetland', 'runoff']) {
		const result = water.create(kind, { height: 4, width: 4 });
		assert.equal(result.value.kind, kind);
		assert.equal(typeof result.value.advance, 'function');
	}
});

test('semantic body profiles preserve distinct physical intent', () => {
	const water = createNatureApi({ seed: 7 }).water;
	const pond = water.pond({ height: 6, width: 6 }).value;
	const runoff = water.runoff({ height: 6, width: 6 }).value;
	assert.equal(pond.kind, 'pond');
	assert.equal(runoff.kind, 'runoff');
	assert.notEqual(pond.recipe.profile.boundary, runoff.recipe.profile.boundary);
	assert.ok(pond.sample(0, 0).depth > runoff.sample(0, 0).depth);
});

test('advanced package export exposes the same core runtime classes', () => {
	assert.equal(typeof WaterDynamicsRuntime3d, 'function');
	assert.equal(typeof ShallowWaterRuntime, 'function');
	assert.equal(typeof OceanWaveField, 'function');
});

function totalDepth(state) {
	return state.height.values.reduce((sum, value) => sum + value, 0);
}

function close(left, right) {
	return Math.abs(left - right) <= EPSILON;
}
