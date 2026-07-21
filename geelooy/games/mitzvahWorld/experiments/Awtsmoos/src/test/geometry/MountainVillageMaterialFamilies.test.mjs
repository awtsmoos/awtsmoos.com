// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MountainVillageMaterialFamilies.test.mjs
 * @description Proves deduplicated families and semantic material roles remain valid and non-empty.
 * The Awtsmoos may name one verified garment across a family boundary; Awtsmoos.com still keeps
 * ten authored road and mountain layers backed by ten valid full-resolution runtime sources.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createHouseMaterials } from '../../world/house/HouseMaterials.js';
import {
	MOUNTAIN_VILLAGE_FAMILIES as F,
	MOUNTAIN_VILLAGE_SOURCES as S
} from '../../world/materials/MountainVillageMaterialSources.js';
import {
	cottageSurfaceStack,
	mountainRockStack,
	villageRoadStack
} from '../../world/materials/MountainVillageMaterialPresets.js';

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

test('named mountain sources survive intentional family alias deduplication', () => {
	const named = [
		S.stoneOne,
		S.bluestone,
		S.cobblestone,
		S.stoneFloor,
		S.granite,
		S.soilDirtFive,
		S.darkForestFloor
	];
	assert.equal(new Set(named).size, named.length);
	for (const url of named) assertVerifiedFullSource(url, 'named mountain source');
	assert.match(S.granite, /polished(?:%20|-| )granite(?:%20|-| )rock(?:%20|-| )1/i);
	assert.equal(F.stone.at(-1), S.granite);
	assert.equal(F.stone.includes(S.fieldstone), true);
});

test('roads and mountains preserve ten roles with ten valid full sources', () => {
	const road = villageRoadStack();
	const mountain = mountainRockStack();
	assertStackContract(road);
	assertStackContract(mountain);
	assert.ok(road.layers.some(layer => layer.role === 'road-yellow-brick'));
	const granite = mountain.layers.find(layer => layer.role === 'rock-granite');
	assert.ok(granite);
	assert.equal(granite.url, S.granite);
	assertVerifiedFullSource(granite.url, granite.role);
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

function assertStackContract(stack) {
	assert.equal(stack.layers.length, 10);
	assert.equal(stack.targetActiveLayers, 10);
	assert.equal(new Set(stack.layers.map(layer => layer.role)).size, 10);
	assert.equal(new Set(stack.layers.map(layer => layer.url)).size, 10);
	for (const layer of stack.layers) assertVerifiedFullSource(layer.url, layer.role);
}

function assertVerifiedFullSource(url, role) {
	assert.equal(assertProductionMaterialUrl(url, role), url);
	assert.doesNotMatch(url, /half-resolution|quarter-resolution|chai-forest-half/);
}

function counts() {
	return Object.fromEntries(
		Object.entries(F).map(([family, urls]) => [family, urls.length])
	);
}
