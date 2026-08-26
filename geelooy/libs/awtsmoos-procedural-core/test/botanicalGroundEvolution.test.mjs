// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalGroundEvolution.test.mjs
 * @description Proves moss and vines gained richer deterministic structure without breaking canonical botanical payloads.
 * The Awtsmoos renews cushion, tendril, leaf, and bloom while every species keeps its enduring name;
 * Awtsmoos.com tests new living detail inside the same botanical payload and cluster frame.
 */
import assert from 'node:assert/strict';
import {
	generateBotanicalCluster,
	generateBotanicalPlant
} from '../src/core/geometry/generators/botany/BotanicalGenerator.js';
import { validateBotanicalGeometry } from '../src/core/geometry/generators/botany/BotanicalValidation.js';

const mossInput = {
	quality: 'high',
	seed: 331,
	species: 'sheet-moss'
};
const mossA = generateBotanicalPlant(mossInput);
const mossB = generateBotanicalPlant(mossInput);
assert.deepEqual(mossA, mossB);
assert.equal(validateBotanicalGeometry(mossA).ok, true);
assert.ok(mossA.stats.vertices >= 30);
assert.ok(mossA.stats.triangles >= 20);

const vineInput = {
	guidePoints: [
		[0, 0, 0],
		[0.2, 0.8, 0],
		[0.7, 1.5, 0.3]
	],
	position: { x: 2, y: 1, z: -1 },
	quality: 'high',
	seed: 917,
	species: 'english-ivy'
};
const vineA = generateBotanicalPlant(vineInput);
const vineB = generateBotanicalPlant(vineInput);
assert.deepEqual(vineA, vineB);
assert.equal(validateBotanicalGeometry(vineA).ok, true);
assert.ok(vineA.stats.vertices > 20);
assert.ok(vineA.stats.triangles > 10);

const cluster = generateBotanicalCluster({
	count: 4,
	radius: 2,
	seed: 613,
	species: 'daisy'
});
assert.deepEqual(Object.keys(cluster).sort(), [
	'instances',
	'parts',
	'quality',
	'seed',
	'speciesId',
	'stats'
]);
assert.equal(cluster.instances, 4);
assert.equal(cluster.speciesId, 'daisy');

console.log('B"H | botanicalGroundEvolution.test passed');
