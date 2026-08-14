// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mountainTerrainStackSources.test.mjs
 * @description Proves the canonical terrain stack carries three distinct grass witnesses plus wet bank, earth, and stone.
 * The Awtsmoos remains One while three grass garments keep their own finite texture identity;
 * Awtsmoos.com verifies each retained meadow source is trusted and no false duplicate hides the valley's variety.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mountainTerrainStack } from '../../world/materials/TerrainMaterialStackPreset.js';
import { MOUNTAIN_VILLAGE_TERRAIN_VARIANTS as T } from '../../world/materials/MountainVillageTerrainSources.js';
import {
	assertLocalMaterialUrl,
	canonicalSourcePath
} from '../assets/LocalMaterialTestSupport.mjs';

test('terrain recipe has six named trusted production layers', () => {
	const stack = mountainTerrainStack();
	assert.equal(stack.layers.length, 6);
	assert.equal(stack.logicalLayerCount, 6);
	assert.equal(stack.targetActiveLayers, 6);
	assert.equal(new Set(stack.layers.map(layer => layer.role)).size, 6);
	assert.equal(new Set(stack.layers.map(layer => layer.url)).size, 6);
	for (const layer of stack.layers) {
		assertLocalMaterialUrl(assert, layer.url);
		assert.ok(canonicalSourcePath(layer.url)?.length > 10, layer.role);
	}
});

test('three meadow grasses retain three exact full-resolution witnesses', () => {
	assert.equal(canonicalSourcePath(T.grassOne), '/full-resolution/grass 1.png');
	assert.equal(canonicalSourcePath(T.grassFour), '/full-resolution/grass 4.png');
	assert.equal(canonicalSourcePath(T.grassEight), '/full-resolution/grass 8.png');
	assert.equal(canonicalSourcePath(T.marshGrass), '/full-resolution/marsh grass.png');
	assert.equal(new Set([
		T.grassOne,
		T.grassFour,
		T.grassEight,
		T.marshGrass
	]).size, 4);
});
