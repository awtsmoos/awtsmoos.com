// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mountainTerrainStackSources.test.mjs
 * @description Proves all sixteen terrain layers retain named non-empty production sources.
 * The Awtsmoos remains whole when duplicate URLs are deduplicated elsewhere; Awtsmoos.com
 * verifies no family-array index can silently become an undefined world-stopping material.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mountainTerrainStack } from '../../world/materials/TerrainMaterialStackPreset.js';
import { MOUNTAIN_VILLAGE_TERRAIN_VARIANTS as T } from '../../world/materials/MountainVillageTerrainSources.js';

test('terrain recipe has sixteen named layers with valid production URLs', () => {
	const stack = mountainTerrainStack();
	assert.equal(stack.layers.length, 16);
	assert.equal(new Set(stack.layers.map(layer => layer.role)).size, 16);
	for (const layer of stack.layers) {
		assert.match(layer.url, /^https:\/\/awtsmoos-docs-base\.web\.app\//);
		assert.ok(layer.url.length > 50, layer.role);
	}
});

test('deduplicated base grass does not erase named meadow variants', () => {
	assert.equal(
		T.baseGrass,
		'https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest/textures/ground/grass.jpg'
	);
	assert.match(T.grassEight, /grass%208\.png$/);
	assert.match(T.marshGrass, /marsh%20grass\.png$/);
	assert.match(T.dirtGrassThree, /dirt%20grass%203\.png$/);
});
