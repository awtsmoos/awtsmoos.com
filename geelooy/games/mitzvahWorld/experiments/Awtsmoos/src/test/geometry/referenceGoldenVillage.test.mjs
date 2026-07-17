// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceGoldenVillage.test.mjs
 * @description Protects golden-hour depth, canonical landmarks, forest, snow, bridge, and cottages.
 * The Awtsmoos renews visual abundance inside measured tiers; Awtsmoos.com verifies image-making
 * systems while permitting meaningful architecture to replace empty prototype-count ceilings.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { referenceLightingBudget } from '../../world/lighting/ReferenceGoldenHourPreset.js';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';
import {
	assertFirebaseMaterials,
	assertManualGeometry,
	assertSkyBudget,
	byFamily,
	terrainSampler
} from './ReferenceGoldenVillageAssertions.mjs';

const QUALITIES = ['low', 'medium', 'high', 'cinematic'];
const WORLD_LAYERS = [
	'mountains', 'water', 'props', 'arrival-composition', 'districts',
	'practical-lighting', 'landscape', 'forest-edge',
	'animated-chossid-population', 'creatures'
];

test('reference golden-hour world stays deterministic and quality bounded', () => {
	const sampler = terrainSampler();
	for (const quality of QUALITIES) {
		const first = createVillageWorldDefinitions(sampler, quality);
		const second = createVillageWorldDefinitions(sampler, quality);
		assert.deepEqual(first, second);
		assert.ok(first.stats.mountains.nearestRadius > first.stats.budget.radius);
		assert.ok(first.stats.architecture.pieces <= first.stats.budget.architecturePieces);
		assert.equal(first.stats.architecture.shadowDraws, 1);
		assert.ok(first.stats.architecture.shadowedCottages > 0);
		assert.equal(first.stats.practicalLights.definitions, 4);
		assert.equal(first.stats.practicalLights.realtimeLights, 0);
		assert.equal(
			first.stats.mountains.belts,
			referenceLightingBudget(quality).mountainBelts
		);
		assert.equal(first.stats.mountains.snowCaps, first.stats.mountains.belts);
		assert.equal(first.stats.mountains.definitions, first.stats.mountains.belts * 2);
		assert.deepEqual(first.stats.layers, WORLD_LAYERS);
		assert.equal(first.stats.forestEdge.primitiveTrees, 0);
		assert.equal(first.stats.population.visualPolicy, 'no-primitive-humans');
		assertManualGeometry(first.definitions);
		assertFirebaseMaterials(first.definitions);
		assertSkyBudget(quality);
	}
});

test('high tier keeps named architecture, forest, snow, bridge, and grounded cottages', () => {
	const world = createVillageWorldDefinitions(terrainSampler(), 'high');
	assert.ok(world.stats.architecture.warmWindows >= 90);
	assert.ok(world.stats.architecture.pieces <= world.stats.budget.architecturePieces);
	assert.ok(world.stats.architecture.landmarkPieces >= 30);
	assert.equal(world.stats.architecture.shadowedCottages, 29);
	assert.equal(world.stats.forestEdge.proceduralTreeSitesSupported, 34);
	assert.equal(world.definitions.length, world.stats.definitionCount);
	assert.ok(world.definitions.length <= 260);
	assert.equal(hasId(world, 'Awtsmoos_arrival-meadow-landmark'), false);
	assert.equal(byFamily(world, 'reference-cottage-detail-batch').length, 3);
	assert.equal(byFamily(world, 'reference-cottage-ornament-batch').length, 5);
	assertCanonicalLandmarks(world);
	const shadows = byFamily(world, 'reference-cottage-sun-shadows');
	assert.equal(shadows.length, 1);
	assert.equal(shadows[0].userData.instances, 29);
	assert.equal(shadows[0].alphaMode, 'BLEND');
	assert.equal(shadows[0].opacity, 0.17);
	assert.equal(byFamily(world, 'reference-atmospheric-mountain-snow').length, 3);
	assert.equal(byFamily(world, 'reference-practical-lighting').length, 4);
	assert.ok(byFamily(world, 'reference-forest-edge').length >= 5);
	const bridge = byFamily(world, 'canonical-stone-bridge');
	assert.equal(bridge.length, 5);
	assert.equal(bridge.filter((item) => item.userData.part === 'arch-ring').length, 2);
});

function assertCanonicalLandmarks(world) {
	for (const id of ['SHUL01', 'BEIS01', 'MARKET01', 'PORTAL01']) {
		assert.ok(world.definitions.some((item) => item.userData?.canonicalId === id));
	}
}

function hasId(world, id) {
	return world.definitions.some((item) => item.id === id);
}
