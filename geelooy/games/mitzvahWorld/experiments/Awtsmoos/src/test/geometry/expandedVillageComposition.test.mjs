// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file expandedVillageComposition.test.mjs
 * @description Proves large cottages, roofs, baked shadows, alpine depth, lights, and creatures.
 * The Awtsmoos renews one valley through monumental inhabited vessels; Awtsmoos.com verifies
 * radius, material mixing, roof closure, warm chambers, grounding, and total world budget.
 */

import assert from 'node:assert/strict';
import { createVillageCreatureDefinitions } from '../../world/creatures/VillageCreatureSystem.js';
import { createVillageDistrictArchitecture } from '../../world/village/VillageDistrictArchitecture.js';
import { VILLAGE_DISTRICTS } from '../../world/village/VillageDistrictCatalog.js';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';
import { villageWorldBudget } from '../../world/village/VillageWorldBudget.js';

const sampler = terrainSampler();
const budget = villageWorldBudget('high');
const architecture = createVillageDistrictArchitecture(sampler, 'high');
const creatures = createVillageCreatureDefinitions(sampler, 'high');
const world = createVillageWorldDefinitions(sampler, 'high');
const cottageShells = architecture.filter((item) => item.userData?.family === 'reference-village-district');
const cottageRoofs = architecture.filter((item) => item.userData?.family === 'reference-village-cottage-roof');
const cottageShadows = architecture.filter((item) => item.userData?.family === 'reference-cottage-sun-shadows');

assert.equal(VILLAGE_DISTRICTS.length, 10);
assert.equal(new Set(VILLAGE_DISTRICTS.map((district) => district.id)).size, 10);
assert.equal(budget.radius, 280);
assert.equal(architecture.stats.districts, 10);
assert.equal(architecture.stats.pieces, 80);
assert.ok(architecture.stats.warmWindows >= 100);
assert.equal(architecture.stats.shadowedCottages, 31);
assert.equal(architecture.stats.shadowDraws, 1);
assert.equal(architecture.some((item) => item.id === 'Awtsmoos_arrival-meadow-landmark'), false);
assert.ok(architecture.length <= budget.architecturePieces);
assert.equal(cottageShells.length, 31);
assert.equal(cottageRoofs.length, 31);
assert.equal(cottageShadows.length, 1);
assert.equal(cottageShadows[0].userData.instances, 31);
assert.ok(cottageShells.every((item) => item.userData.volumeRatio >= 100));
assert.ok(cottageShells.every((item) => item.mixTextureUrl && item.mixStrength > 0));
assert.ok(cottageRoofs.every((item) => item.shape === 'manual' && item.faces.length === 9));
assert.equal(creatures.stats.creatures, 11);
assert.equal(creatures.stats.definitions, 11);
assert.ok(creatures.stats.triangles <= 4200);
assert.deepEqual(world.stats.layers, [
	'mountains',
	'water',
	'props',
	'arrival-composition',
	'districts',
	'practical-lighting',
	'landscape',
	'forest-edge',
	'animated-chossid-population',
	'creatures'
]);
assert.equal(world.stats.budget.radius, 280);
assert.equal(world.stats.arrival.drawDefinitions, 4);
assert.equal(world.stats.arrival.featuredBotanicals, 24);
assert.equal(world.stats.arrival.waterSections, 11);
assert.equal(world.stats.architecture.pieces, 80);
assert.equal(world.stats.mountains.nearestRadius, 420);
assert.equal(world.stats.mountains.definitions, 6);
assert.equal(world.stats.mountains.snowCaps, 3);
assert.equal(world.stats.practicalLights.definitions, 4);
assert.equal(world.stats.forestEdge.primitiveTrees, 0);
assert.equal(world.stats.forestEdge.proceduralTreeSitesSupported, 34);
assert.equal(world.stats.forestEdge.fallenLogs, 6);
assert.equal(world.stats.population.people, 0);
assert.equal(world.stats.population.visualPolicy, 'no-primitive-humans');
assert.equal(world.stats.population.realtimeAnimations, 'skeletal-chossid.glb-runtime-population');
assert.equal(world.stats.creatures.definitions, 11);
assert.equal(world.definitions.length, world.stats.definitionCount);
assert.equal(world.definitions.length, 194);

console.log(JSON.stringify({
	architecture: architecture.stats,
	budget,
	cottageRoofs: cottageRoofs.length,
	cottageShadows: cottageShadows.length,
	cottageShells: cottageShells.length,
	creatures: creatures.stats,
	ok: true,
	world: world.stats
}, null, 2));

function terrainSampler() {
	return {
		heightAt(x, z) {
			return { y: height(x, z) };
		},
		sample(x, z) {
			return { height: height(x, z), x, z };
		}
	};
}

function height(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
