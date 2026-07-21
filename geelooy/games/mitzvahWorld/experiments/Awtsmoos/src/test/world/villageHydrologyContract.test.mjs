// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageHydrologyContract.test.mjs
 * @description Proves the canonical source, cascades, bridge, and outlet form one finite world contract.
 * The Awtsmoos gives every drop its descent and every crossing its vessel; Awtsmoos.com keeps
 * water, masonry, and local material paths joined without frame polling or decorative duplication.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createRiverHydrology,
	RIVER_CASCADES
} from '../../world/village/VillageRiverHydrology.js';
import { createStoneBridgeDefinitions } from '../../world/village/VillageStoneBridgeSystem.js';
import { createWaterfallDefinitions } from '../../world/village/VillageWaterfallSystem.js';

const FLAT_GROUND_HEIGHT = 2.5;
const HYDROLOGY_SEGMENTS = 96;
const LOCAL_ASSET_PREFIX = './assets/';
const flatGround = () => FLAT_GROUND_HEIGHT;

test('the canonical river descends continuously from source to outlet', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);

	assert.equal(hydrology.points.length, HYDROLOGY_SEGMENTS + 1);
	assert.equal(hydrology.stats.cascades, RIVER_CASCADES.length);
	assert.ok(hydrology.stats.sourceY > hydrology.stats.outletY);
	assert.ok(hydrology.stats.totalDrop > 0);

	for (let index = 1; index < hydrology.points.length; index += 1) {
		const upstream = hydrology.points[index - 1];
		const downstream = hydrology.points[index];
		assert.ok(upstream.y > downstream.y, `River rose at sample ${index}.`);
		assertFinitePoint(downstream);
	}
});

test('waterfall layers share finite hydrology-bound geometry and local textures', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);
	const definitions = createWaterfallDefinitions(flatGround, hydrology);
	const waterLayers = definitions.filter((definition) => definition.userData?.waterVariant);

	assert.deepEqual(
		waterLayers.map((definition) => definition.userData.waterVariant),
		['waterfall', 'foam', 'mist']
	);

	for (const definition of waterLayers) {
		assert.equal(definition.shape, 'manual');
		assert.ok(definition.vertices.length > 0);
		assert.ok(definition.faces.length > 0);
		assertLocalTexture(definition.textureUrl);
		assert.ok(definition.vertices.flat().every(Number.isFinite));
	}

	const ledges = definitions.find((definition) => definition.userData?.part === 'fieldstone-ledge');
	assert.equal(ledges.userData.instances, RIVER_CASCADES.length);
	assert.ok(ledges.vertices.flat().every(Number.isFinite));
});

test('BRIDGE01 exposes one solid traversable deck with local masonry', () => {
	const definitions = createStoneBridgeDefinitions({ x: 18, z: 7 }, flatGround);
	const deck = definitions.find((definition) => definition.userData?.canonicalId === 'BRIDGE01');

	assert.ok(deck, 'The canonical bridge deck must exist.');
	assert.equal(deck.solid, true);
	assert.ok(deck.size.x >= 12);
	assert.ok(deck.size.z >= 4);
	assert.ok(deck.size.y >= 0.5);
	assertLocalTexture(deck.textureUrl);

	const masonry = definitions.filter((definition) => definition.textureUrl);
	assert.ok(masonry.length >= 5);
	for (const definition of masonry) {
		assertLocalTexture(definition.textureUrl);
	}
});

function assertFinitePoint(point) {
	assert.ok(Number.isFinite(point.x));
	assert.ok(Number.isFinite(point.y));
	assert.ok(Number.isFinite(point.z));
	assert.ok(Number.isFinite(point.width));
}

function assertLocalTexture(url) {
	assert.equal(typeof url, 'string');
	assert.ok(url.startsWith(LOCAL_ASSET_PREFIX), `Expected same-origin material URL, received ${url}.`);
}
