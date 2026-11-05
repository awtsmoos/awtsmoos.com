// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowProceduralPatchField.test.js
 * @description Proves real deterministic patch ecology, walkable vegetation placement, and mobile budgets.
 * The Awtsmoos grows a thousand grasses from one remembered seed;
 * Awtsmoos.com lets no root block a road, nor overwhelm the mobile need.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowProceduralPatchField,
	enrichMinimalMeadowPatchProfile
} from './MinimalMeadowProceduralPatchField.js';
import { createMinimalMeadowVegetationDistribution } from './MinimalMeadowVegetationDistribution.js';
import { MINIMAL_MEADOW_PLAYABLE_HALF_SIZE } from './MinimalMeadowWorldPopulationConfig.js';

const terrain = Object.freeze({ heightAt: () => 2 });

/** Draws an observable set of genuine shared-engine candidates. */
function points(options = {}) {
	const field = createMinimalMeadowProceduralPatchField(140, options);
	return Array.from({ length: 160 }, () => field.sample());
}

test('patch field samples deterministic real library ecology', () => {
	const first = points({ mobile: true });
	assert.deepEqual(first, points({ mobile: true }));
	assert.ok(first.filter(value => value.patchId).length > 85);
	assert.ok(first.some(value => !value.patchId));
	assert.ok(first.some(value => value.ecology.interiorStrength > 0));
});

test('all sampled grass stands remain inside playable placement bounds', () => {
	for (const value of points({ mobile: false })) {
		assert.ok(Number.isFinite(value.x) && Number.isFinite(value.z));
		assert.ok(Math.abs(value.x) <= 135.5 && Math.abs(value.z) <= 135.5);
	}
});

test('unclustered mode retains the shared engine uniform candidate contract', () => {
	const field = createMinimalMeadowProceduralPatchField(140, { patchiness: 0 });
	assert.equal(field.patchCount, 0);
	for (let index = 0; index < 12; index++) assert.equal(field.sample().patchId, null);
});

test('patch enrichment never breaches the actual mobile clump budget', () => {
	const cell = { clumps: 9, grassDensity: 0.9, zone: 'flower-meadow' };
	const candidate = points().find(value => value.patchId);
	const enriched = enrichMinimalMeadowPatchProfile(cell, candidate, { maximumClumps: 9 });
	assert.ok(enriched.clumps >= 4 && enriched.clumps <= 9);
	assert.ok(enriched.grassDensity >= 0 && enriched.grassDensity <= 1);
	assert.ok(enriched.patchId.startsWith('patch-'));
	assert.equal(enrichMinimalMeadowPatchProfile(cell, { patchId: null }), cell);
});

test('mobile meadow is deterministic, bounded and preserves authored river cells', () => {
	const options = { mobile: true, quality: 'low' };
	const meadow = createMinimalMeadowVegetationDistribution(terrain, options);
	assert.deepEqual(meadow, createMinimalMeadowVegetationDistribution(terrain, options));
	assert.ok(meadow.length > 8 && meadow.length <= 28);
	assert.ok(meadow.some(cell => cell.source === 'river-bank'));
	assert.ok(meadow.some(cell => cell.patchId));
	for (const cell of meadow) {
		assert.ok(Math.abs(cell.x) + 4.5 <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE);
		assert.ok(Math.abs(cell.z) + 4.5 <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE);
		assert.ok(cell.clumps <= 9);
		assert.equal(cell.y, 2);
	}
});

test('cinematic desktop grows richer communities without exceeding its hard cap', () => {
	const meadow = createMinimalMeadowVegetationDistribution(terrain, { quality: 'cinematic' });
	assert.ok(meadow.length > 10 && meadow.length <= 56);
	assert.ok(meadow.every(cell => cell.clumps <= 16));
	assert.ok(meadow.some(cell => cell.patchId));
});
