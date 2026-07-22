// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceGoldenVillage.test.mjs
 * @description Protects golden-hour depth, terrain continuity, livelihood, history, and ecology.
 * The Awtsmoos renews visual abundance inside measured tiers; Awtsmoos.com verifies meaningful
 * architecture, terrain-fitting homes, paths, weathered roofs, gardens, streets, trees, and life.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { referenceLightingBudget } from '../../world/lighting/ReferenceGoldenHourPreset.js';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';
import { VILLAGE_WORLD_LAYERS } from '../../world/village/VillageWorldLayers.js';
import {
	assertMonotonicVillageQuality,
	assertVillageDefinitionBudget,
	MAXIMUM_VILLAGE_DEFINITIONS,
	VILLAGE_QUALITY_FLOORS
} from './VillageDefinitionBudgetAssertions.mjs';
import {
	assertFirebaseMaterials,
	assertManualGeometry,
	assertSkyBudget,
	byFamily,
	terrainSampler
} from './ReferenceGoldenVillageAssertions.mjs';

const QUALITIES = Object.keys(VILLAGE_QUALITY_FLOORS);

test('reference golden-hour world stays deterministic and quality bounded', () => {
	const sampler = terrainSampler();
	const counts = [];
	for (const quality of QUALITIES) {
		const first = createVillageWorldDefinitions(sampler, quality);
		const second = createVillageWorldDefinitions(sampler, quality);
		assert.deepEqual(first, second);
		counts.push(assertVillageDefinitionBudget(quality, first, second));
		assert.ok(first.stats.mountains.nearestRadius > first.stats.budget.radius);
		assert.ok(first.stats.architecture.pieces <= first.stats.budget.architecturePieces);
		assert.equal(first.stats.architecture.shadowDraws, 1);
		assert.ok(first.stats.architecture.shadowedCottages > 0);
		assert.equal(first.stats.practicalLights.definitions, 4);
		assert.equal(first.stats.practicalLights.realtimeLights, 0);
		assert.ok(first.stats.heroCraftDefinitions > 0);
		assert.ok(first.stats.heroGardenDefinitions > 0);
		assert.ok(first.stats.forestEdge.proceduralTreeSitesSupported > 0);
		assert.equal(first.stats.forestEdge.primitiveTrees, 0);
		assert.ok(first.stats.houseBubbles.totalDetails > 0);
		assert.ok(first.stats.life.housePrograms > 0);
		assert.equal(first.stats.props.terrainBlend.batches, 2);
		assert.equal(first.stats.props.pedestrianWear.batches, 2);
		assert.equal(first.stats.mountains.belts, referenceLightingBudget(quality).mountainBelts);
		assert.equal(first.stats.mountains.snowCaps, first.stats.mountains.belts);
		assert.equal(first.stats.mountains.definitions, first.stats.mountains.belts * 2);
		assert.deepEqual(first.stats.layers, VILLAGE_WORLD_LAYERS);
		assert.equal(first.stats.population.visualPolicy, 'no-primitive-humans');
		assertManualGeometry(first.definitions);
		assertFirebaseMaterials(first.definitions);
		assertSkyBudget(quality);
	}
	assertMonotonicVillageQuality(counts);
});

test('high tier keeps named architecture, terrain life, forest, snow, and bridge', () => {
	const world = createVillageWorldDefinitions(terrainSampler(), 'high');
	assert.ok(world.stats.architecture.warmWindows >= 90);
	assert.ok(world.stats.architecture.pieces <= world.stats.budget.architecturePieces);
	assert.ok(world.stats.architecture.landmarkPieces >= 30);
	assert.equal(world.stats.architecture.shadowedCottages, 29);
	assert.equal(world.stats.houseBubbles.houses, 18);
	assert.equal(world.stats.houseBubbles.batches, 7);
	assert.equal(world.stats.life.housePrograms, 18);
	assert.equal(world.stats.forestEdge.proceduralTreeSitesSupported, 34);
	assert.equal(world.definitions.length, world.stats.definitionCount);
	assert.ok(world.definitions.length >= VILLAGE_QUALITY_FLOORS.high);
	assert.ok(world.definitions.length <= MAXIMUM_VILLAGE_DEFINITIONS);
	assert.equal(byFamily(world, 'reference-cottage-detail-batch').length, 3);
	assert.equal(byFamily(world, 'reference-cottage-ornament-batch').length, 5);
	assert.equal(byFamily(world, 'canonical-house-bubble').length, 7);
	assert.equal(byFamily(world, 'canonical-district-dressing').length, 4);
	assert.equal(byFamily(world, 'canonical-environmental-history').length, 4);
	assert.equal(byFamily(world, 'canonical-street-hierarchy').length, 3);
	assert.equal(byFamily(world, 'canonical-terrain-blend').length, 2);
	assert.equal(byFamily(world, 'canonical-pedestrian-wear').length, 2);
	assertCanonicalLandmarks(world);
	const roofs = byFamily(world, 'reference-village-cottage-roof');
	assert.ok(roofs.every(roof => roof.userData.roofAge >= 0.25));
	assert.ok(new Set(roofs.map(roof => roof.mixStrength)).size >= 8);
	const shadows = byFamily(world, 'reference-cottage-sun-shadows');
	assert.equal(shadows.length, 1);
	assert.equal(shadows[0].userData.instances, 29);
	assert.equal(shadows[0].alphaMode, 'BLEND');
	assert.equal(byFamily(world, 'reference-atmospheric-mountain-snow').length, 3);
	assert.equal(byFamily(world, 'reference-practical-lighting').length, 4);
	assert.ok(byFamily(world, 'reference-forest-edge').length >= 5);
	const bridge = byFamily(world, 'canonical-stone-bridge');
	assert.equal(bridge.length, 5);
	assert.equal(bridge.filter(item => item.userData.part === 'arch-ring').length, 2);
});

function assertCanonicalLandmarks(world) {
	for (const id of ['SHUL01', 'BEIS01', 'MARKET01', 'PORTAL01']) {
		assert.ok(world.definitions.some(item => item.userData?.canonicalId === id));
	}
}
