// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalCatalog.test.mjs
 * @description Proves that the complete named garden remains searchable,
 * immutable, and unique beneath the unifying truth of the Awtsmoos.
 */
import assert from 'node:assert/strict';
import {
	BOTANICAL_ARCHETYPES,
	BOTANICAL_SPECIES,
	getBotanicalSpecies,
	listBotanicalSpecies,
	searchBotanicalSpecies
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

const ids = listBotanicalSpecies();
const required = [
	'daisy',
	'iris',
	'rose-red',
	'hydrangea',
	'foxglove',
	'allium',
	'english-ivy',
	'maidenhair-fern',
	'ornamental-grass',
	'sheet-moss',
	'wisteria',
	'marsh-marigold'
];

assert.ok(ids.length >= 100, 'the procedural catalog should contain the full reference garden');
assert.equal(new Set(ids).size, ids.length, 'species IDs must remain unique');
for (const id of required) {
	assert.ok(ids.includes(id), `${id} must remain available`);
}
for (const archetype of BOTANICAL_ARCHETYPES) {
	assert.ok(
		BOTANICAL_SPECIES.some((species) => species.archetype === archetype),
		`${archetype} must have at least one species`
	);
}
for (const species of BOTANICAL_SPECIES) {
	assert.equal(Object.isFrozen(species), true, `${species.id} must be immutable`);
	assert.equal(Object.isFrozen(species.colors), true, `${species.id} colors must be immutable`);
	assert.equal(getBotanicalSpecies(species.label), species);
}
assert.ok(searchBotanicalSpecies('water').length >= 3);
assert.ok(searchBotanicalSpecies('fern').length >= 4);
assert.equal(searchBotanicalSpecies('').length, ids.length);

console.log(JSON.stringify({
	ok: true,
	species: ids.length,
	archetypes: BOTANICAL_ARCHETYPES.length,
	waterResults: searchBotanicalSpecies('water').map((species) => species.id)
}, null, 2));
