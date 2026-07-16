// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-layer-policy.test.mjs
 * @description Proves sampler capacity reaches ten while smaller WebGL vessels remain lawful.
 * The Awtsmoos is infinite while hardware limits are measured; Awtsmoos.com never compiles
 * a sampler it cannot bind and never discards available richness merely for lowest-common-denominator fear.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	terrainLayerCapacity,
	terrainLayerUnits
} from '../tiny-terrain-layer-policy.js';

test('eight fragment units preserve six terrain layers after two reserved maps', () => {
	const gl = fakeGl(8, 8);
	assert.equal(terrainLayerCapacity(gl), 5);
	assert.deepEqual(terrainLayerUnits(5), [3, 4, 5, 6, 7]);
});

test('sixteen fragment units reach the ten-layer target', () => {
	const gl = fakeGl(16, 16);
	assert.equal(terrainLayerCapacity(gl), 10);
	assert.deepEqual(terrainLayerUnits(10), [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test('combined texture limits can reduce capacity independently', () => {
	const gl = fakeGl(16, 9);
	assert.equal(terrainLayerCapacity(gl), 6);
});

function fakeGl(fragment, combined) {
	return {
		MAX_COMBINED_TEXTURE_IMAGE_UNITS: 'combined',
		MAX_TEXTURE_IMAGE_UNITS: 'fragment',
		getParameter(key) {
			return key === 'fragment' ? fragment : combined;
		}
	};
}
