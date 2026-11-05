// B"H
// Boruch Hashem
// Blessed is He

/** @file expandedVillageComposition.test.mjs @description Protects current measured village batching and actors. */
import assert from 'node:assert/strict';
import { createVillageCreatureDefinitions } from '../../world/creatures/VillageCreatureSystem.js';
import { createVillageDistrictArchitecture } from '../../world/village/VillageDistrictArchitecture.js';
import { VILLAGE_DISTRICTS } from '../../world/village/VillageDistrictCatalog.js';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';
import { VILLAGE_WORLD_LAYERS } from '../../world/village/VillageWorldLayers.js';
import { villageWorldBudget } from '../../world/village/VillageWorldBudget.js';
import { MAXIMUM_VILLAGE_DEFINITIONS, VILLAGE_QUALITY_FLOORS } from './VillageDefinitionBudgetAssertions.mjs';
const sampler = terrainSampler();
const budget = villageWorldBudget('high');
const architecture = createVillageDistrictArchitecture(sampler, 'high');
const creatures = createVillageCreatureDefinitions(sampler, 'high');
const world = createVillageWorldDefinitions(sampler, 'high');
const cottageShells = byFamily(architecture, 'reference-village-district');
const cottageRoofs = byFamily(architecture, 'reference-village-cottage-roof');
const cottageShadows = byFamily(architecture, 'reference-cottage-sun-shadows');
const bridge = byFamily(world.definitions, 'canonical-stone-bridge');
assert.equal(VILLAGE_DISTRICTS.length, 10);
assert.equal(new Set(VILLAGE_DISTRICTS.map(district => district.id)).size, 10);
assert.equal(budget.radius, 280);
assert.equal(architecture.stats.districts, 10);
assert.ok(architecture.stats.pieces <= budget.architecturePieces);
assert.ok(architecture.stats.landmarkPieces >= 30);
assert.equal(architecture.stats.warmWindows, 52);
assert.equal(architecture.stats.shadowedCottages, cottageShells.length);
assert.equal(architecture.stats.shadowDraws, 1);
assert.equal(cottageShells.length, 18);
assert.equal(cottageRoofs.length, cottageShells.length);
assert.equal(cottageShadows.length, 1);
assert.equal(cottageShadows[0].userData.instances, cottageShells.length);
assert.ok(cottageShells.every(item => item.userData.volumeRatio >= 100));
assert.ok(cottageRoofs.every(item => item.shape === 'manual' && item.faces.length === 9));
assertCanonicalLandmarks(architecture);
assert.equal(creatures.stats.creatures, 8);
assert.equal(creatures.stats.liveHostiles, 6);
assert.equal(creatures.stats.totalActors, 14);
assert.ok(creatures.stats.triangles <= 3200);
assert.deepEqual(world.stats.layers, VILLAGE_WORLD_LAYERS);
assert.equal(world.stats.houseBubbles.houses, 18);
assert.equal(world.stats.houseBubbles.batches, 7);
assert.ok(world.stats.houseBubbles.totalDetails > 150);
assert.equal(world.stats.life.housePrograms, 18);
assert.equal(world.stats.life.dailyCheckpoints, 60);
assert.equal(world.stats.props.districtDressing.batches, 4);
assert.equal(world.stats.props.environmentalHistory.batches, 4);
assert.equal(world.stats.props.streetHierarchy.batches, 3);
assert.equal(world.stats.props.terrainBlend.batches, 2);
assert.equal(world.stats.props.pedestrianWear.batches, 2);
assert.equal(world.stats.arrival.drawDefinitions, 4);
assert.equal(bridge.length, 5);
assert.equal(bridge.filter(item => item.userData?.part === 'arch-ring').length, 2);
assert.equal(world.stats.mountains.definitions, 6);
assert.equal(world.stats.mountains.snowCaps, 3);
assert.equal(world.stats.practicalLights.definitions, 4);
assert.equal(world.stats.forestEdge.primitiveTrees, 0);
assert.equal(world.stats.population.visualPolicy, 'no-primitive-humans');
assert.equal(world.definitions.length, world.stats.definitionCount);
assert.ok(world.definitions.length >= VILLAGE_QUALITY_FLOORS.high);
assert.ok(world.definitions.length <= MAXIMUM_VILLAGE_DEFINITIONS);
function assertCanonicalLandmarks(definitions) { for (const id of ['SHUL01', 'BEIS01', 'MARKET01', 'PORTAL01']) assert.ok(definitions.some(item => item.userData?.canonicalId === id)); }
function byFamily(definitions, family) { return definitions.filter(item => item.userData?.family === family); }
function terrainSampler() { return { heightAt: (x, z) => ({ y: height(x, z) }), sample: (x, z) => ({ height: height(x, z), x, z }) }; }
function height(x, z) { return 0.8 + x * 0.002 + z * 0.003; }
