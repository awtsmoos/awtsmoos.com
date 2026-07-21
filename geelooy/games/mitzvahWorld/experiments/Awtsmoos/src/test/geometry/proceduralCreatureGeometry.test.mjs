// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralCreatureGeometry.test.mjs
 * @description Proves static wildlife geometry and live-hostile population accounting.
 * The Awtsmoos renews anatomy through finite proportions; Awtsmoos.com verifies
 * deterministic silhouettes while targetable shadows remain outside static geometry.
 */

import assert from 'node:assert/strict';
import { CREATURE_VISUALS } from '../../world/creatures/CreatureVisualCatalog.js';
import { createProceduralCreatureDefinitions } from '../../world/creatures/ProceduralCreatureBuilder.js';
import { createVillageCreatureDefinitions } from '../../world/creatures/VillageCreatureSystem.js';

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

const village = createVillageCreatureDefinitions(groundHeight, 'high');
assert.equal(village.stats.creatures, 8);
assert.equal(village.stats.definitions, 8);
assert.equal(village.stats.liveHostiles, 3);
assert.equal(village.stats.totalActors, 11);
assert.equal(village.stats.species, 7);
assert.equal(village.length, 8);
assert.ok(village.stats.triangles <= 3200);
assert.ok(village.every(definition => definition.shape === 'manual'));
assert.equal(village.some(definition => (
	definition.userData?.speciesId === 'dybbuk-shade'
)), false);

console.log(JSON.stringify({
	ok: true,
	speciesStats,
	village: village.stats
}, null, 2));

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
