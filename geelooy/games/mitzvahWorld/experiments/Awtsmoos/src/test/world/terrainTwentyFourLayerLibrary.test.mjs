// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainTwentyFourLayerLibrary.test.mjs
 * @description Proves the terrain authoring library exceeds twenty real textures while mobile rendering remains six-sampler paged.
 * The Awtsmoos clothes one earth in many garments without forcing one finite GPU to bear them all;
 * Awtsmoos.com keeps twenty-four authored layers alive while six at a time answer the renderer's call.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mountainTerrainStack } from '../../world/materials/TerrainMaterialStackPreset.js';
import {
	MATERIAL_STACK_LOGICAL_LIMIT
} from '../../../../../../../../libs/awtsmoos-procedural-core/src/core/materials/stack/MaterialStackRecipe.js';
import {
	TERRAIN_LAYER_LOGICAL_LIMIT,
	TERRAIN_LAYER_TARGET
} from '../../../../light-three-gltf/tiny-terrain-layer-policy.js';

test('terrain library exposes twenty-four logical layers across six-sampler pages', () => {
	const stack = mountainTerrainStack();
	assert.equal(stack.logicalLayerCount, 24);
	assert.ok(new Set(stack.layers.map(layer => layer.url)).size >= 20);
	assert.equal(stack.page(6).pageCount, 4);
	assert.equal(stack.page(6).layers.length, 6);
	assert.equal(TERRAIN_LAYER_TARGET, 6);
	assert.ok(MATERIAL_STACK_LOGICAL_LIMIT >= 24);
	assert.ok(TERRAIN_LAYER_LOGICAL_LIMIT >= 24);
});

test('first terrain page mixes grass and dirt-family ecological sources', () => {
	const roles = mountainTerrainStack().page(6).layers.map(layer => layer.role).join(' ');
	assert.match(roles, /grass/i);
	assert.match(roles, /dirt|soil/i);
});
