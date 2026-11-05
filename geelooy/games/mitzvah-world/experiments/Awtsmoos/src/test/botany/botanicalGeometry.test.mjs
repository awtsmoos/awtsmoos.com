// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalGeometry.test.mjs
 * @description Proves deterministic finite geometry across every species and
 * quality vessel, honoring the ordered abundance revealed by the Awtsmoos.
 */
import assert from 'node:assert/strict';
import {
	generateBotanicalCluster,
	generateBotanicalPlant,
	listBotanicalSpecies,
	validateBotanicalGeometry
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

const qualities = ['low', 'medium', 'high', 'cinematic'];
const speciesIds = listBotanicalSpecies();
const totals = {};

for (const quality of qualities) {
	let triangles = 0;
	for (const species of speciesIds) {
		const plant = generateBotanicalPlant({
			species,
			quality,
			seed: 770,
			position: { x: 2.5, y: 1.2, z: -4.75 }
		});
		const validation = validateBotanicalGeometry(plant);
		assert.equal(validation.ok, true, `${species}/${quality}: ${validation.issues.join(', ')}`);
		triangles += plant.stats.triangles;
	}
	totals[quality] = triangles;
}

const representatives = [
	'daisy',
	'rose-red',
	'foxglove',
	'allium',
	'lily-of-the-valley',
	'bleeding-heart',
	'english-ivy',
	'hosta',
	'sheet-moss',
	'maidenhair-fern',
	'ornamental-grass',
	'hydrangea'
];
for (const species of representatives) {
	const options = {
		species,
		quality: 'high',
		seed: 613,
		position: { x: 3, y: 2, z: -1 }
	};
	assert.deepEqual(generateBotanicalPlant(options), generateBotanicalPlant(options));
}

const cluster = generateBotanicalCluster({
	species: 'lavender',
	quality: 'medium',
	seed: 18,
	count: 12,
	radius: 2.4,
	position: { x: 4, y: 1, z: 7 }
});
assert.equal(cluster.instances, 12);
assert.equal(validateBotanicalGeometry(cluster).ok, true);
assert.ok(totals.low < totals.high);
assert.ok(totals.high <= totals.cinematic);

console.log(JSON.stringify({
	ok: true,
	species: speciesIds.length,
	qualities,
	totalTrianglesByQuality: totals,
	cluster: cluster.stats
}, null, 2));
