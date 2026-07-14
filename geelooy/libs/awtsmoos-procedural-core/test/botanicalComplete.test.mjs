// B"H
// Boruch Hashem
// Blessed is He

/** Every catalog entry must become finite geometry, not merely a decorative name. */
import assert from 'node:assert/strict';
import {
	BOTANICAL_ARCHETYPES,
	generateBotanicalPlant,
	getBotanicalSpecies,
	listBotanicalSpecies,
	validateBotanicalGeometry
} from '../src/index.js';

const speciesIds = listBotanicalSpecies();
assert.equal(speciesIds.length, 113, 'The complete botanical catalog must contain exactly 113 entries.');
assert.equal(new Set(speciesIds).size, 113, 'Every botanical id must be unique.');
const rows = [];
const archetypes = new Set();
for (const [index, speciesId] of speciesIds.entries()) {
	const species = getBotanicalSpecies(speciesId);
	const plant = generateBotanicalPlant({ quality: 'low', seed: 613 + index, species: speciesId });
	const validation = validateBotanicalGeometry(plant);
	assert.equal(validation.ok, true, `${speciesId}: ${validation.issues.join(', ')}`);
	assert.ok(plant.stats.vertices > 0, `${speciesId} must contain vertices.`);
	assert.ok(plant.stats.triangles > 0, `${speciesId} must contain triangles.`);
	assert.equal(plant.speciesId, speciesId);
	archetypes.add(species.archetype);
	rows.push({ id: speciesId, parts: plant.stats.parts, triangles: plant.stats.triangles });
}
assert.deepEqual([...archetypes].sort(), [...BOTANICAL_ARCHETYPES].sort());
console.log(JSON.stringify({ archetypes: archetypes.size, species: rows.length, rows }, null, 2));
