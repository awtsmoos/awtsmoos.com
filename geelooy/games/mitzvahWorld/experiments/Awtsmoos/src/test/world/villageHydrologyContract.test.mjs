// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageHydrologyContract.test.mjs
 * @description Proves one realistic source, channel, waterfall, bridge, pool, and outlet contract.
 * The Awtsmoos gives every drop descent and concealed depth; Awtsmoos.com guards the river's
 * wet shoulders, shallow shelves, thalweg, local stone vessel, and traversable crossing.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createRiverHydrology,
	RIVER_CASCADES,
	sampleHydrologyAt
} from '../../world/village/VillageRiverHydrology.js';
import {
	createRiverBedGeometry,
	RIVER_BED_BANDS
} from '../../world/village/VillageRiverBedGeometry.js';
import { createStoneBridgeDefinitions } from '../../world/village/VillageStoneBridgeSystem.js';
import { createWaterBodyDefinitions } from '../../world/village/VillageWaterBodies.js';
import { createWaterfallDefinitions } from '../../world/village/VillageWaterfallSystem.js';

const FLAT_GROUND_HEIGHT = 2.5;
const HYDROLOGY_SEGMENTS = 96;
const LOCAL_ASSET_PREFIX = './assets/';
const EXPECTED_FLOW_REGIMES = Object.freeze([
	'mountain-source',
	'plunge-pool',
	'fast-narrows',
	'village-current',
	'calm-lower-pool',
	'outlet-run'
]);
const flatGround = () => FLAT_GROUND_HEIGHT;

test('the canonical river descends continuously with finite channel metadata', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);

	assert.equal(hydrology.points.length, HYDROLOGY_SEGMENTS + 1);
	assert.equal(hydrology.stats.cascades, RIVER_CASCADES.length);
	assert.ok(hydrology.stats.sourceY > hydrology.stats.outletY);
	assert.ok(hydrology.stats.totalDrop > 0);
	assert.ok(hydrology.stats.maximumDepth > hydrology.stats.minimumDepth);

	for (let index = 1; index < hydrology.points.length; index += 1) {
		const upstream = hydrology.points[index - 1];
		const downstream = hydrology.points[index];
		assert.ok(upstream.y > downstream.y, `River rose at sample ${index}.`);
		assertFinitePoint(downstream);
	}
});

test('plunge pool, narrows, village reach, lower pool, and outlet remain distinct', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);
	const plungePool = sampleHydrologyAt(hydrology, 0.16);
	const fastNarrows = sampleHydrologyAt(hydrology, 0.42);

	assert.deepEqual(hydrology.stats.flowRegimes, EXPECTED_FLOW_REGIMES);
	assert.equal(plungePool.flowRegime, 'plunge-pool');
	assert.equal(fastNarrows.flowRegime, 'fast-narrows');
	assert.ok(plungePool.depth > fastNarrows.depth);
	assert.ok(fastNarrows.flowSpeed > plungePool.flowSpeed);
	assert.ok(plungePool.bankWetness > 0.65);
});

test('the static riverbed forms wet shoulders, shallow shelves, and a deep thalweg', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);
	const geometry = createRiverBedGeometry(hydrology);
	const definitions = createWaterBodyDefinitions(flatGround, hydrology);
	const bed = definitions.find((definition) => definition.userData?.part === 'river-bed-channel');
	const river = definitions.find((definition) => definition.userData?.waterVariant === 'river');

	assert.equal(definitions.length, 3);
	assert.equal(geometry.vertices.length, hydrology.points.length * RIVER_BED_BANDS);
	assert.equal(
		geometry.faces.length,
		(hydrology.points.length - 1) * (RIVER_BED_BANDS - 1)
	);
	assert.ok(geometry.vertices.flat().every(Number.isFinite));

	const firstSection = geometry.vertices.slice(0, RIVER_BED_BANDS);
	assert.ok(firstSection[2][1] < firstSection[1][1]);
	assert.ok(firstSection[2][1] < firstSection[3][1]);
	assert.ok(firstSection[1][1] < firstSection[0][1]);
	assert.ok(firstSection[3][1] < firstSection[4][1]);

	assert.ok(bed, 'The static riverbed definition must exist.');
	assert.equal(bed.shape, 'manual');
	assert.equal(bed.transparent, false);
	assert.equal(bed.userData.staticGeometry, true);
	assertLocalTexture(bed.textureUrl);

	assert.ok(river, 'The animated river surface must remain present.');
	assert.equal(river.texturePolicy.animated, true);
	assert.equal(river.userData.waterVariant, 'river');
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
	assert.ok(Number.isFinite(point.depth));
	assert.ok(Number.isFinite(point.bankWetness));
	assert.ok(Number.isFinite(point.flowSpeed));
	assert.ok(point.depth > 0);
	assert.ok(point.bankWetness >= 0 && point.bankWetness <= 1);
	assert.ok(point.flowSpeed > 0);
}

function assertLocalTexture(url) {
	assert.equal(typeof url, 'string');
	assert.ok(url.startsWith(LOCAL_ASSET_PREFIX), `Expected same-origin material URL, received ${url}.`);
}
