// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MountainVillageMaterialFamilies.test.mjs
 * @description Proves real full-source families feed terrain, roads, mountains, and cottages.
 * The Awtsmoos renews one village through many distinct garments; Awtsmoos.com verifies each
 * deduplicated family URL, active stack, and house pair instead of trusting decorative aliases.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createHouseMaterials } from '../../world/house/HouseMaterials.js';
import {
	MOUNTAIN_VILLAGE_FAMILIES as F
} from '../../world/materials/MountainVillageMaterialSources.js';
import {
	cottageSurfaceStack,
	mountainRockStack,
	villageRoadStack
} from '../../world/materials/MountainVillageMaterialPresets.js';

test('canonical families contain many distinct deployed variants', () => {
	assert.deepEqual(counts(), {
		bricks: 8,
		earth: 8,
		forest: 4,
		grass: 8,
		grassTransitions: 3,
		roof: 4,
		stone: 7,
		water: 4,
		wood: 6
	});
	for (const [family, urls] of Object.entries(F)) {
		assert.equal(new Set(urls).size, urls.length, family);
		for (const url of urls) {
			assert.equal(assertProductionMaterialUrl(url, family), url);
			assert.doesNotMatch(url, /half-resolution|quarter-resolution|chai-forest-half/);
		}
	}
});

test('roads and mountains use ten unique active full-source layers', () => {
	for (const stack of [villageRoadStack(), mountainRockStack()]) {
		assert.equal(stack.layers.length, 10);
		assert.equal(stack.targetActiveLayers, 10);
		assert.equal(new Set(stack.layers.map(layer => layer.url)).size, 10);
	}
	assert.ok(villageRoadStack().layers.some(layer => layer.role === 'road-yellow-brick'));
});

test('cottage recipe and live house assignments use specific surface pairs', () => {
	const stack = cottageSurfaceStack();
	const materials = createHouseMaterials();
	assert.equal(stack.layers.length, 11);
	assert.equal(stack.targetActiveLayers, 10);
	assert.equal(materials.wall.texturePolicy.shader, 'world-space-two-source-physical-mix');
	assert.deepEqual(materials.wall.texturePolicy.materialRoles, [
		'cottage-fieldstone',
		'cottage-limestone'
	]);
	assert.deepEqual(materials.side.texturePolicy.materialRoles, [
		'cottage-white-brick',
		'cottage-weathered-brick'
	]);
	assert.deepEqual(materials.roof.texturePolicy.materialRoles, [
		'cottage-roof',
		'cottage-roof-small-tile'
	]);
});

function counts() {
	return Object.fromEntries(
		Object.entries(F).map(([family, urls]) => [family, urls.length])
	);
}
