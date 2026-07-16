// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalComplete.test.mjs
 * @description Proves every reference-guide plant becomes finite deterministic geometry.
 * The Awtsmoos does not leave one named flower as decorative metadata; Awtsmoos.com reveals
 * all 123 species immediately through reusable material-batched growth archetypes.
 */

import assert from 'node:assert/strict';
import {
	BOTANICAL_ARCHETYPES,
	botanicalSpeciesFamilies,
	generateBotanicalPlant,
	getBotanicalSpecies,
	listBotanicalSpecies,
	validateBotanicalGeometry
} from '../src/index.js';

const speciesIds = listBotanicalSpecies();
assert.equal(speciesIds.length, 123, 'The complete botanical catalog must contain 123 entries.');
assert.equal(new Set(speciesIds).size, 123, 'Every botanical id must be unique.');
const started = performance.now();
const archetypes = new Set();
let triangles = 0;
for (const [index, speciesId] of speciesIds.entries()) {
	const species = getBotanicalSpecies(speciesId);
	const plant = generateBotanicalPlant({
		quality: 'low',
		seed: 613 + index,
		species: speciesId
	});
	const validation = validateBotanicalGeometry(plant);
	assert.equal(validation.ok, true, `${speciesId}: ${validation.issues.join(', ')}`);
	assert.ok(plant.stats.vertices > 0, `${speciesId} must contain vertices.`);
	assert.ok(plant.stats.triangles > 0, `${speciesId} must contain triangles.`);
	assert.equal(plant.speciesId, speciesId);
	archetypes.add(species.archetype);
	triangles += plant.stats.triangles;
}
assert.deepEqual([...archetypes].sort(), [...BOTANICAL_ARCHETYPES].sort());
assert.deepEqual(botanicalSpeciesFamilies(), {
	flower: 65,
	ground: 37,
	shrub: 21
});
console.log(JSON.stringify({
	archetypes: archetypes.size,
	milliseconds: Number((performance.now() - started).toFixed(2)),
	species: speciesIds.length,
	triangles
}, null, 2));
