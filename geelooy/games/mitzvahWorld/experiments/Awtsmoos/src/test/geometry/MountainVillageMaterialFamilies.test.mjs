// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MountainVillageMaterialFamilies.test.mjs
 * @description Proves deployed family diversity and bounded semantic material stacks.
 * The Awtsmoos may join one verified garment across roles; Awtsmoos.com keeps every
 * current family count, authored layer, source identity, and cottage pairing explicit.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createHouseMaterials } from '../../world/house/HouseMaterials.js';
import { MOUNTAIN_VILLAGE_FAMILIES as F, MOUNTAIN_VILLAGE_SOURCES as S } from '../../world/materials/MountainVillageMaterialSources.js';
import { cottageSurfaceStack, mountainRockStack, villageRoadStack } from '../../world/materials/MountainVillageMaterialPresets.js';

test('canonical families contain distinct verified deployed variants', () => {
	assert.deepEqual(counts(), {
		bricks: 8,
		earth: 7,
		forest: 4,
		grass: 8,
		grassTransitions: 3,
		roof: 4,
		stone: 6,
		water: 4,
		wood: 5
	});
	for (const [family, urls] of Object.entries(F)) {
		assert.equal(new Set(urls).size, urls.length, family);
		for (const url of urls) assertVerifiedFullSource(url, family);
	}
});

test('named mountain sources preserve intentional source identities', () => {
	const named = [S.stoneOne, S.bluestone, S.cobblestone, S.stoneFloor, S.granite, S.soilDirtFive, S.darkForestFloor];
	assert.equal(new Set(named).size, named.length);
	for (const url of named) assertVerifiedFullSource(url, 'named source');
	assert.equal(F.stone.at(-1), S.granite);
	assert.equal(F.stone.includes(S.fieldstone), true);
});

test('road and mountain stacks retain measured active roles', () => {
	const road = villageRoadStack();
	const mountain = mountainRockStack();
	assertStackContract(road, 6);
	assertStackContract(mountain, 10);
	assert.ok(road.layers.some(layer => layer.role === 'road-fieldstone-center'));
	const granite = mountain.layers.find(layer => layer.role === 'rock-granite');
	assert.equal(granite.url, S.granite);
});

test('cottage recipe and live house assignments use specific surface pairs', () => {
	const stack = cottageSurfaceStack();
	const materials = createHouseMaterials();
	assert.equal(stack.layers.length, 11);
	assert.equal(stack.targetActiveLayers, 10);
	assert.deepEqual(materials.wall.texturePolicy.materialRoles, ['cottage-fieldstone', 'cottage-limestone']);
	assert.deepEqual(materials.side.texturePolicy.materialRoles, ['cottage-white-brick', 'cottage-weathered-brick']);
	assert.deepEqual(materials.roof.texturePolicy.materialRoles, ['cottage-roof', 'cottage-roof-small-tile']);
});

function assertStackContract(stack, count) {
	assert.equal(stack.layers.length, count);
	assert.equal(stack.targetActiveLayers, count);
	assert.equal(new Set(stack.layers.map(layer => layer.role)).size, count);
	assert.equal(new Set(stack.layers.map(layer => layer.url)).size, count);
	for (const layer of stack.layers) assertVerifiedFullSource(layer.url, layer.role);
}
function assertVerifiedFullSource(url, role) {
	assert.equal(assertProductionMaterialUrl(url, role), url);
	assert.doesNotMatch(url, /half-resolution|quarter-resolution|chai-forest-half/);
}
function counts() {
	return Object.fromEntries(Object.entries(F).map(([family, urls]) => [family, urls.length]));
}
