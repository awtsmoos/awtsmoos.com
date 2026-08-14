// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainRealismProfile.test.mjs
 * @description Proves the canonical material owns quality-specific macro ecology instead of renderer fallback constants.
 * The Awtsmoos reveals one earth through several finite quality vessels; Awtsmoos.com verifies cinematic distance,
 * warp, wetness, slope, height, detail, and chroma arrive on the actual material that the tiny renderer consumes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainMaterial } from '../../world/terrain/TerrainMaterialFactory.js';
import {
	terrainRealismProfile,
	terrainRealismProfiles
} from '../../world/terrain/TerrainRealismProfile.js';

test('quality profiles become broader and richer toward cinematic', () => {
	const profiles = terrainRealismProfiles();
	assert.ok(profiles.cinematic.a[0] < profiles.high.a[0]);
	assert.ok(profiles.high.a[0] < profiles.medium.a[0]);
	assert.ok(profiles.cinematic.a[3] > profiles.high.a[3]);
	assert.ok(profiles.cinematic.b[1] > profiles.high.b[1]);
	assert.ok(profiles.cinematic.c[2] > profiles.high.c[2]);
	assert.equal(terrainRealismProfile('unknown'), profiles.high);
});

test('high terrain material publishes the canonical mixing vectors', () => {
	const image = {
		complete: true,
		naturalHeight: 2048,
		naturalWidth: 2048,
		src: 'https://materials.test/grass.png'
	};
	const material = createTerrainMaterial({
		dirtImage: image,
		grassImage: image,
		quality: 'high',
		size: 512
	});
	const expected = terrainRealismProfile('high');
	assert.deepEqual(material.terrainMixingA, expected.a);
	assert.deepEqual(material.terrainMixingB, expected.b);
	assert.deepEqual(material.terrainMixingC, expected.c);
	assert.deepEqual(material.texturePolicy.macroMixing, expected);
	assert.match(material.texturePolicy.mix, /three-octave/);
});
