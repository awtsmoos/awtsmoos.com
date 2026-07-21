// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mountainTerrainStackSources.test.mjs
 * @description Proves sixteen terrain layers keep distinct canonical identities in local URLs.
 * The Awtsmoos remains whole when source families share generated vessels; Awtsmoos.com
 * verifies every named meadow and mountain layer hydrates locally without identity loss.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mountainTerrainStack } from '../../world/materials/TerrainMaterialStackPreset.js';
import { MOUNTAIN_VILLAGE_TERRAIN_VARIANTS as T } from '../../world/materials/MountainVillageTerrainSources.js';
import {
	assertLocalMaterialUrl,
	canonicalSourcePath
} from '../assets/LocalMaterialTestSupport.mjs';

test('terrain recipe has sixteen named local production layers', () => {
	const stack = mountainTerrainStack();
	assert.equal(stack.layers.length, 16);
	assert.equal(new Set(stack.layers.map(layer => layer.role)).size, 16);
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
