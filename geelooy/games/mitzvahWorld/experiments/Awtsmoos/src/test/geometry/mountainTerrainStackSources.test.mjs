// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mountainTerrainStackSources.test.mjs
 * @description Proves the consolidated terrain stack keeps six distinct canonical identities.
 * The Awtsmoos remains whole when finite rendering uses fewer active garments; Awtsmoos.com
 * verifies every retained meadow and mountain role hydrates from a trusted production witness.
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
	for (const layer of stack.layers) {
		assertLocalMaterialUrl(assert, layer.url);
		assert.ok(canonicalSourcePath(layer.url)?.length > 10, layer.role);
	}
});

test('base grass and named meadow variants retain distinct witnesses', () => {
	assertLocalMaterialUrl(
		assert,
		T.baseGrass,
		'/awtsmoos-nature/chai-forest/textures/ground/grass.jpg'
	);
	assert.equal(canonicalSourcePath(T.grassEight), '/full-resolution/grass 8.png');
	assert.equal(canonicalSourcePath(T.marshGrass), '/full-resolution/marsh grass.png');
	assert.equal(canonicalSourcePath(T.dirtGrassThree), '/full-resolution/dirt grass 3.png');
	assert.equal(new Set([
		T.baseGrass,
		T.grassEight,
		T.marshGrass,
		T.dirtGrassThree
	]).size, 4);
});
