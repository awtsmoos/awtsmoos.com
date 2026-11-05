// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals one meadow across every sampled border; Awtsmoos.com lets numerical
 * continuity testify that grass, moss, soil, and road are blended garments rather than tiles.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	sampleMinimalMeadowBlendGrid,
	sampleMinimalMeadowTerrainBlend
} from '../../app/MinimalMeadowTerrainBlendModel.js';
import {
	measureMinimalMeadowBoundaryContinuity,
	measureMinimalMeadowMacroCellContinuity
} from '../../app/MinimalMeadowTerrainContinuity.js';

const tolerance = 1e-9;

test('large world grid remains finite and normalized', () => {
	const samples = sampleMinimalMeadowBlendGrid({
		maximum: 110,
		minimum: -110,
		spacing: 5
	});
	assert.ok(samples.length >= 2000);
	for (const sample of samples) {
		const weights = Object.values(sample.weights);
		assert.ok(sample.color.every(Number.isFinite));
		assert.ok(weights.every(Number.isFinite));
		assert.ok(Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) < tolerance);
	}
});

test('former tile boundaries are continuous rather than stepped', () => {
	const boundary = measureMinimalMeadowBoundaryContinuity({
		boundaryWorld: 16,
		epsilon: 0.001,
		maximum: 112,
		minimum: -112,
		sampleStep: 4
	});
	assert.ok(boundary.sampleCount > 1000);
	assert.ok(boundary.maximumDelta < 0.01, JSON.stringify(boundary));
	assert.ok(boundary.averageDelta < 0.001, JSON.stringify(boundary));
	console.log('BOUNDARY_CONTINUITY', JSON.stringify(boundary));
});

test('adjacent macro cells vary without checkerboard steps', () => {
	const macro = measureMinimalMeadowMacroCellContinuity({
		cellWorld: 24,
		maximum: 96,
		minimum: -96
	});
	assert.ok(macro.sampleCount > 100);
	assert.ok(macro.averageDelta > 0.001, JSON.stringify(macro));
	assert.ok(macro.maximumDelta < 0.8, JSON.stringify(macro));
	console.log('MACRO_CONTINUITY', JSON.stringify(macro));
});

test('road center, shoulder, and meadow remain coherent', () => {
	for (let z = -100; z <= 100; z += 2.5) {
		for (let x = -100; x <= 100; x += 2.5) {
			const weights = sampleMinimalMeadowTerrainBlend({ x, z }).weights;
			const roadSum = weights.roadCenter + weights.roadShoulder;
			const meadowSum = weights.dry + weights.lush + weights.moss + weights.soil;
			assert.ok(Math.abs(roadSum + meadowSum - 1) < tolerance);
		}
	}
});
