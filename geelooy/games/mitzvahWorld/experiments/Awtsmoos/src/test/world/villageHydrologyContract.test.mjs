// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageHydrologyContract.test.mjs
 * @description Proves one descending source, channel, pool, and static thalweg contract.
 * The Awtsmoos gives every drop descent and concealed depth; Awtsmoos.com guards wet
 * shoulders, shallow shelves, trusted stone, and the animated current in one finite vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRiverHydrology, RIVER_CASCADES, sampleHydrologyAt } from '../../world/village/VillageRiverHydrology.js';
import { createRiverBedGeometry, RIVER_BED_BANDS } from '../../world/village/VillageRiverBedGeometry.js';
import { createWaterBodyDefinitions } from '../../world/village/VillageWaterBodies.js';
import { assertFiniteHydrologyPoint, assertProductionTexture, flatGround, HYDROLOGY_SEGMENTS } from './VillageHydrologyTestSupport.mjs';

const EXPECTED_FLOW_REGIMES = Object.freeze([
	'mountain-source',
	'plunge-pool',
	'fast-narrows',
	'village-current',
	'calm-lower-pool',
	'outlet-run'
]);

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
		assertFiniteHydrologyPoint(downstream);
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
	const bed = definitions.find(definition => definition.userData?.part === 'river-bed-channel');
	const river = definitions.find(definition => definition.userData?.waterVariant === 'river');
	assert.equal(definitions.length, 3);
	assert.equal(geometry.vertices.length, hydrology.points.length * RIVER_BED_BANDS);
	assert.equal(geometry.faces.length, (hydrology.points.length - 1) * (RIVER_BED_BANDS - 1));
	assert.ok(geometry.vertices.flat().every(Number.isFinite));
	const firstSection = geometry.vertices.slice(0, RIVER_BED_BANDS);
	assert.ok(firstSection[2][1] < firstSection[1][1]);
	assert.ok(firstSection[2][1] < firstSection[3][1]);
	assert.ok(firstSection[1][1] < firstSection[0][1]);
	assert.ok(firstSection[3][1] < firstSection[4][1]);
	assert.ok(bed);
	assert.equal(bed.shape, 'manual');
	assert.equal(bed.transparent, false);
	assert.equal(bed.userData.staticGeometry, true);
	assertProductionTexture(bed.textureUrl, 'river-bed-channel');
	assert.ok(river);
	assert.equal(river.texturePolicy.animated, true);
	assert.equal(river.userData.waterVariant, 'river');
});
