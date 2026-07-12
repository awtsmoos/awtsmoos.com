// B"H
import assert from 'node:assert/strict';
import { createVillageLandscapeDefinitions } from '../../world/village/VillageLandscapeSystem.js';

const landscape = createVillageLandscapeDefinitions(groundHeight);
const definitions = landscape.definitions;

assert.deepEqual(landscape.stats, {
	bushes: 24,
	bushBatches: 3,
	bushTriangles: 576,
	flowerInstances: 72,
	flowerBatches: 5,
	gardenBeds: 3,
	shoreStones: 18
});
assert.equal(definitions.length, 29);
assert.equal(new Set(definitions.map((definition) => definition.id)).size, definitions.length);

const bushBatches = definitions.filter((definition) => (
	definition.userData?.family === 'village-bushes'
));
const gardenBeds = definitions.filter((definition) => (
	definition.userData?.family === 'village-garden-bed'
));
const shoreStones = definitions.filter((definition) => (
	definition.userData?.family === 'lake-shore-stone'
));

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
	if (definition.vertices) {
		for (const point of definition.vertices) {
			assert.ok(point.every(Number.isFinite), `${definition.id} must have finite manual geometry`);
		}
	}
}

console.log(JSON.stringify({
	ok: true,
	definitionCount: definitions.length,
	stats: landscape.stats,
	families: {
		bushBatches: bushBatches.length,
		gardenBeds: gardenBeds.length,
		shoreStones: shoreStones.length
	}
}, null, 2));

function assertObjectVector(value, label) {
	assert.equal(Array.isArray(value), false, `${label} must not use the obsolete array contract`);
	assert.ok(value && typeof value === 'object', `${label} must be an object`);
	assert.ok(
		['x', 'y', 'z'].every((axis) => Number.isFinite(value[axis])),
		`${label} must contain finite x/y/z values`
	);
}

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
