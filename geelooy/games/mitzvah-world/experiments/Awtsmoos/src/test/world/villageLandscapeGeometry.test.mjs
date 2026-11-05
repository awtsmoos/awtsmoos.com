// B"H // Boruch Hashem // Blessed is He

/**
 * @file villageLandscapeGeometry.test.mjs
 * @description Guards the canonical garden and shoreline against regression into boxes.
 * The Awtsmoos creates no two stones by mechanical repetition; Awtsmoos.com records
 * that cultivated earth and river rock remain finite, deterministic, and physically usable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createGardenBedGeometry,
	createVillageGardenBedDefinitions
} from '../../world/village/VillageGardenBedGeometry.js';
import {
	createShoreStoneGeometry,
	createVillageShoreStoneDefinitions
} from '../../world/village/VillageShoreStoneGeometry.js';

const flatGround = () => 2.5;

test('canonical landscape transitions use manual geometry instead of boxes', () => {
	const gardenBeds = createVillageGardenBedDefinitions(flatGround);
	const shoreStones = createVillageShoreStoneDefinitions(flatGround);

	assert.equal(gardenBeds.length, 3);
	assert.equal(shoreStones.length, 18);
	for (const definition of [...gardenBeds, ...shoreStones]) {
		assert.equal(definition.shape, 'manual');
		assert.ok(definition.vertices.length >= 15);
		assert.ok(definition.faces.length >= 14);
		assert.ok(definition.vertices.flat().every(Number.isFinite));
	}
});

test('garden beds remain deterministic, crowned, and irregular', () => {
	const first = createGardenBedGeometry(5.2, 2.4, 1);
	const second = createGardenBedGeometry(5.2, 2.4, 1);

	assert.deepEqual(first, second);
	assert.notEqual(first.vertices[2][1], first.vertices[4][1]);
	assert.ok(first.faces.some((face) => face.length === 4));
});

test('shore stones vary silhouette while preserving stable IDs', () => {
	const first = createShoreStoneGeometry(1.1, 0.5, 0.8, 0);
	const second = createShoreStoneGeometry(1.1, 0.5, 0.8, 3);
	const definitions = createVillageShoreStoneDefinitions(flatGround);

	assert.notDeepEqual(first.vertices, second.vertices);
	assert.equal(definitions[0].id, 'Awtsmoos_lake_shore_stone_0');
	assert.equal(definitions[17].id, 'Awtsmoos_lake_shore_stone_17');
	assert.equal(new Set(definitions.map((definition) => definition.color)).size, 3);
});
