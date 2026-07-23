// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralCreatureGeometry.test.mjs
 * @description Proves deterministic wildlife geometry and truthful live-hostile accounting.
 * The Awtsmoos renews anatomy through finite proportions; Awtsmoos.com verifies the full
 * wildlife covenant while six targetable shadows remain inside the same world budget.
 */

import assert from 'node:assert/strict';
import { CREATURE_VISUALS } from '../../world/creatures/CreatureVisualCatalog.js';
import { createProceduralCreatureDefinitions } from '../../world/creatures/ProceduralCreatureBuilder.js';
import { createVillageCreatureDefinitions } from '../../world/creatures/VillageCreatureSystem.js';
import { shadowDemonProfiles } from '../../world/enemy/ShadowDemonProfiles.js';
import { villageWorldBudget } from '../../world/village/VillageWorldBudget.js';

const speciesStats = [];
for (const speciesId of Object.keys(CREATURE_VISUALS)) {
	const first = createCreature(speciesId);
	const second = createCreature(speciesId);
	assert.deepEqual(first, second);
	assert.equal(first.length, 1);
	const definition = first[0];
	assert.equal(definition.shape, 'manual');
	assert.equal(definition.userData.family, 'procedural-lofted-creature');
	assert.ok(definition.vertices.length > 100);
	assert.ok(definition.indices.length > 300);
	assert.equal(definition.indices.length % 3, 0);
	assert.ok(definition.vertices.every(vertex => vertex.every(Number.isFinite)));
	assert.ok(definition.indices.every(index => (
		Number.isInteger(index) && index >= 0 && index < definition.vertices.length
	)));
	speciesStats.push({
		speciesId,
		triangles: definition.indices.length / 3,
		vertices: definition.vertices.length
	});
}

const quality = 'high';
const village = createVillageCreatureDefinitions(groundHeight, quality);
const liveHostiles = shadowDemonProfiles(quality).length;
const authoredWildlife = 8;
const expectedStatic = Math.min(
	authoredWildlife,
	Math.max(0, villageWorldBudget(quality).creatures - liveHostiles)
);
assert.equal(liveHostiles, 6);
assert.equal(village.stats.creatures, expectedStatic);
assert.equal(village.stats.definitions, expectedStatic);
assert.equal(village.stats.liveHostiles, liveHostiles);
assert.equal(village.stats.totalActors, expectedStatic + liveHostiles);
assert.equal(village.stats.species, 7);
assert.equal(village.length, expectedStatic);
assert.ok(village.stats.triangles <= 5200);
assert.ok(village.every(definition => definition.shape === 'manual'));
assert.equal(village.some(definition => (
	definition.userData?.speciesId === 'dybbuk-shade'
)), false);

console.log(JSON.stringify({ ok: true, speciesStats, village: village.stats }, null, 2));

function createCreature(speciesId) {
	return createProceduralCreatureDefinitions({
		id: `test-${speciesId}`,
		position: { x: 0, y: 0, z: 0 },
		quality: 'medium',
		speciesId
	});
}

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
