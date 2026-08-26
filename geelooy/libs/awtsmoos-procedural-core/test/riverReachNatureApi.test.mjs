// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file riverReachNatureApi.test.mjs
 * @description Verifies the canonical river-reach doorway without broadening into rendering, terrain, crossings, or ecology.
 * The Awtsmoos renews every tested current before assertion can hold it; Awtsmoos.com lets these finite witnesses guard
 * determinism, immutable banks, honest frames, and legacy water motion so one completed river law may safely flow onward.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createRiverReachFrames,
	createRiverReachPath,
	createRiverReachPlan
} from '../src/core/ecosystem/index.js';
import { createNatureApi } from '../src/core/natureApi/index.js';

const EPSILON = 1e-9;

test('river reach is deterministic and independent from Nature quality', () => {
	const request = {
		length: 42,
		meanderAmplitude: 5,
		pathSamples: 11,
		seed: 'same-reach'
	};
	const low = createNatureApi({ quality: 'low', seed: 'world' }).water.reach('river', request);
	const high = createNatureApi({ quality: 'cinematic', seed: 'world' }).water.reach('river', request);
	assert.equal(low.kind, 'river-reach-plan');
	assert.deepEqual(low.value, high.value);
});

test('authored centerline preserves coordinates and symmetric bank evidence', () => {
	const habitat = ['reeds'];
	const plan = createRiverReachPlan({
		baseWidth: 10,
		centerline: [[0, 3, 0], [0, 3, 10], [4, 2, 20]],
		habitat,
		profile: { cascade: [0, 0], depth: [1, 1], speed: [2, 2] },
		seed: 613
	});
	habitat.push('external-mutation');
	assert.deepEqual(
		plan.path.points.map(({ x, y, z }) => [x, y, z]),
		[[0, 3, 0], [0, 3, 10], [4, 2, 20]]
	);
	for (const sample of plan.samples) {
		assert.ok(Object.isFrozen(sample.habitat));
		assert.deepEqual(sample.habitat, ['reeds']);
		assert.ok(close((sample.leftBank.x + sample.rightBank.x) / 2, sample.center.x));
		assert.ok(close((sample.leftBank.z + sample.rightBank.z) / 2, sample.center.z));
		assert.ok(close(bankDistance(sample), sample.width));
	}
});

test('duplicate leading points recover the nearest real direction without non-finite frames', () => {
	const path = createRiverReachPath({
		centerline: [[0, 0, 0], [0, 0, 0], [0, 0, 10]],
		seed: 18
	});
	const frames = createRiverReachFrames(path.points);
	assert.ok(close(frames[0].tangent.x, 0));
	assert.ok(close(frames[0].tangent.z, 1));
	for (const frame of frames) {
		for (const value of [frame.tangent.x, frame.tangent.y, frame.tangent.z, frame.lateral.x, frame.lateral.y, frame.lateral.z]) {
			assert.ok(Number.isFinite(value));
		}
	}
});

test('reach realism scales only matching spatial samples through the existing authority', () => {
	const common = {
		baseWidth: 8,
		centerline: [[0, 0, 0], [0, 0, 10], [0, 0, 20]],
		profile: { cascade: [0, 0], depth: [1, 1], speed: [1, 1] },
		seed: 42
	};
	const base = createRiverReachPlan(common);
	const scaled = createRiverReachPlan({
		...common,
		reaches: [{
			depthScale: 2,
			from: 0,
			habitat: ['pool'],
			id: 'deep-pool',
			to: 0.5,
			widthScale: 2
		}]
	});
	assert.ok(close(scaled.samples[0].width, base.samples[0].width * 2));
	assert.ok(close(scaled.samples[0].depth, base.samples[0].depth * 2));
	assert.equal(scaled.samples[0].reachId, 'deep-pool');
	assert.deepEqual(scaled.samples[0].habitat, ['pool']);
});

test('Nature keeps the legacy river runtime while exposing the additive reach doorway', () => {
	const nature = createNatureApi({ seed: 'legacy-water' });
	const runtime = nature.water.river('stream');
	const reach = nature.water.reach('stream', { pathSamples: 5, seed: 'spatial-water' });
	assert.equal(runtime.kind, 'river-runtime');
	assert.equal(reach.kind, 'river-reach-plan');
	assert.equal(typeof createRiverReachPlan, 'function');
	assert.equal(reach.value.samples.length, 5);
});

function bankDistance(sample) {
	return Math.hypot(
		sample.leftBank.x - sample.rightBank.x,
		sample.leftBank.z - sample.rightBank.z
	);
}

function close(left, right) {
	return Math.abs(left - right) <= EPSILON;
}
