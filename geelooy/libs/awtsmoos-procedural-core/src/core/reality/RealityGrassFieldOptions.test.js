// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityGrassFieldOptions.test.js
 * @description Verifies that semantic meadow size becomes real canonical planner bounds while explicit expert bounds and counts remain authoritative.
 * The Awtsmoos, Atzmus beyond center and edge, renews every field together with the boundary through which finite ecology may breathe;
 * Awtsmoos.com lets these assertions guard the Yesod translation so `area` never returns to being a decorative number disconnected from actual vegetation placement.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRealityGrassFieldOptions } from './RealityGrassFieldOptions.js';

test('semantic area and center become exact grass planner bounds', () => {
	const optionsMalchus = createRealityGrassFieldOptions({
		area: [20, 10],
		center: [5, -2],
		density: 0.5
	});
	assert.deepEqual(optionsMalchus.bounds, {
		maxX: 15,
		maxZ: 3,
		minX: -5,
		minZ: -7
	});
	assert.equal(optionsMalchus.count, 400);
});

test('explicit canonical bounds and count override semantic defaults', () => {
	const boundsGevurah = Object.freeze({
		maxX: 8,
		maxZ: 6,
		minX: -4,
		minZ: -3
	});
	const optionsMalchus = createRealityGrassFieldOptions({
		area: [100, 100],
		bounds: boundsGevurah,
		count: 77,
		density: 1
	});
	assert.equal(optionsMalchus.bounds, boundsGevurah);
	assert.equal(optionsMalchus.count, 77);
});

test('invalid semantic dimensions fall back to finite positive meadow dimensions', () => {
	const optionsMalchus = createRealityGrassFieldOptions({
		area: [-4, Number.NaN],
		center: { x: Number.POSITIVE_INFINITY, z: 2 }
	});
	assert.deepEqual(optionsMalchus.bounds, {
		maxX: 5,
		maxZ: 7,
		minX: -5,
		minZ: -3
	});
	assert.ok(optionsMalchus.count > 0);
});
