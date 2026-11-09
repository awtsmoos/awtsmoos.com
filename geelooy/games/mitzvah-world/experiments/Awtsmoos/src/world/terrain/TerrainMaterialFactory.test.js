// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.test.js
 * @description Proves the Chapter 4 Task 4 factory wiring: the terrain
 * material no longer ships `anisotropy: false` with an arbitrary
 * `mapRepeat: [10, 10]` and no sampling policy. It now carries the shared
 * grass ground sampling — real-pixel-derived repeat, sRGB + mipmaps +
 * LinearMipmapLinear, desktop/mobile anisotropy — and defaults its base
 * texture to the existing catalog `baseGrass` entry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainMaterial } from './TerrainMaterialFactory.js';
import { GRASS_URLS } from '../TerrainTextureCatalog.js';

test('terrain material carries the shared grass ground sampling at high quality', () => {
	const material = createTerrainMaterial({ quality: 'high' });
	assert.equal(material.anisotropy, 8, 'anisotropy must be 8, never false');
	assert.deepEqual([...material.mapRepeat], [9, 9], 'repeat must be 256m * 72 tex/m / 2048px');
	assert.equal(material.textureUrl, GRASS_URLS[0], 'default base map is the catalog baseGrass entry');
	const policy = material.texturePolicy;
	assert.equal(policy.colorSpace, 'srgb');
	assert.equal(policy.mipmaps, true);
	assert.equal(policy.minFilter, 'LinearMipmapLinear');
	assert.equal(policy.magFilter, 'Linear');
	assert.equal(policy.wrapS, 'RepeatWrapping');
	assert.equal(policy.wrapT, 'RepeatWrapping');
	assert.equal(policy.grassGroundMaterialId, 'mitzvah-world-shared-grass-ground');
	assert.equal(policy.grassGroundSourceUrl, GRASS_URLS[0]);
	assert.ok(Math.abs(policy.grassTileWorldMeters[0] - 2048 / 72) < 1e-9);
	assert.equal(policy.texelsPerWorld, 72);
});

test('mobile terrain material uses mobile anisotropy', () => {
	const material = createTerrainMaterial({ mobile: true, quality: 'high' });
	assert.equal(material.anisotropy, 4);
	assert.equal(material.texturePolicy.colorSpace, 'srgb');
});

test('low quality keeps a valid, unstretched sampling', () => {
	const material = createTerrainMaterial({ quality: 'low' });
	assert.equal(material.anisotropy, 8);
	assert.equal(material.texturePolicy.texelsPerWorld, 52);
	assert.ok(material.texturePolicy.grassTileWorldMeters[0] <= 40, 'low tile must respect the anti-stretch guard');
	assert.ok(Math.abs(material.texturePolicy.grassTileWorldMeters[0] - 2048 / 52) < 1e-9);
});

test('explicit remote fallback URL still wins over the catalog default', () => {
	const material = createTerrainMaterial({ fallbackUrl: GRASS_URLS[1], quality: 'high' });
	assert.equal(material.textureUrl, GRASS_URLS[1]);
	assert.equal(material.anisotropy, 8);
});
