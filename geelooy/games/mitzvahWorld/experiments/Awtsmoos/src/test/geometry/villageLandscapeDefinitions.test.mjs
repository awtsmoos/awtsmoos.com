// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageLandscapeDefinitions.test.mjs
 * @description Guards the denser reference landscape after deterministic garden
 * composition, joining visible beauty and measured truth before the Awtsmoos.
 */
import assert from 'node:assert/strict';
import { createVillageLandscapeDefinitions } from '../../world/village/VillageLandscapeSystem.js';

const landscape = createVillageLandscapeDefinitions(groundHeight, 'high');
const definitions = landscape.definitions;

assert.deepEqual(landscape.stats, {
	bushes: 24,
	bushBatches: 3,
	bushTriangles: 576,
	flowerInstances: 140,
	flowerSpecies: 113,
	flowerBatches: 6,
	flowerVertices: 8470,
	flowerTriangles: 7130,
	gardenBeds: 3,
	shoreStones: 18,
	quality: 'high'
});
assert.equal(definitions.length, 30);
assert.equal(new Set(definitions.map((definition) => definition.id)).size, definitions.length);

const botanicalBatches = family('village-botanical-garden');
const bushBatches = family('village-bushes');
const gardenBeds = family('village-garden-bed');
const shoreStones = family('lake-shore-stone');

assert.equal(botanicalBatches.length, 6);
assert.equal(bushBatches.length, 3);
assert.equal(gardenBeds.length, 3);
assert.equal(shoreStones.length, 18);

for (const definition of [...gardenBeds, ...shoreStones]) {
	assert.equal(definition.shape, 'box');
	assertObjectVector(definition.position, `${definition.id} position`);
	assertObjectVector(definition.size, `${definition.id} size`);
	assert.equal(definition.solid, true);
	assert.equal(definition.userData.AwtsmoosLod.className, 'landmark');
}
for (const definition of definitions) {
	assert.ok(definition.textureUrl, `${definition.id} should retain a real material URL`);
	for (const point of definition.vertices || []) {
		assert.ok(point.every(Number.isFinite), `${definition.id} must contain finite geometry`);
	}
}

console.log(JSON.stringify({
	ok: true,
	definitionCount: definitions.length,
	stats: landscape.stats,
	families: {
		botanicalBatches: botanicalBatches.length,
		bushBatches: bushBatches.length,
		gardenBeds: gardenBeds.length,
		shoreStones: shoreStones.length
	}
}, null, 2));

function family(name) {
	return definitions.filter((definition) => definition.userData?.family === name);
}

function assertObjectVector(value, label) {
	assert.equal(Array.isArray(value), false, `${label} must not use the obsolete array contract`);
	assert.ok(value && typeof value === 'object', `${label} must be an object`);
	assert.ok(['x', 'y', 'z'].every((axis) => Number.isFinite(value[axis])));
}

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
