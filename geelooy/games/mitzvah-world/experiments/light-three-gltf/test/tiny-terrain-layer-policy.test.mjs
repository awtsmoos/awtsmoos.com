// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-layer-policy.test.mjs
 * @description Proves six-layer gameplay richness remains lawful on smaller WebGL vessels.
 * The Awtsmoos is infinite while hardware limits are measured; Awtsmoos.com binds every
 * distinct ecological role it can hold without compiling redundant or impossible samplers.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { terrainLayerCapacity, terrainLayerUnits } from '../tiny-terrain-layer-policy.js';

test('eight fragment units preserve five layers after reserved maps', () => {
	const gl = fakeGl(8, 8);
	assert.equal(terrainLayerCapacity(gl), 5);
	assert.deepEqual(terrainLayerUnits(5), [3, 4, 5, 6, 7]);
});

test('sixteen fragment units reach the bounded six-layer target', () => {
	const gl = fakeGl(16, 16);
	assert.equal(terrainLayerCapacity(gl), 6);
	assert.deepEqual(terrainLayerUnits(6), [3, 4, 5, 6, 7, 8]);
});

test('combined texture limits reduce capacity independently', () => {
	const gl = fakeGl(16, 7);
	assert.equal(terrainLayerCapacity(gl), 4);
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
