// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainCooperativePreparation.test.mjs
 * @description Proves cooperative terrain preserves exact geometry while yielding bounded work.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createTerrainGeometry,
	createTerrainGeometryAsync
} from '../../world/TerrainGeometry.js';

test('cooperative terrain is identical and yields throughout canonical sampling', async () => {
	const yieldReceipts = [];
	const progress = [];
	const synchronous = createTerrainGeometry(96, 12);
	const cooperative = await createTerrainGeometryAsync(96, 12, {
		onProgress: (current, total) => progress.push([current, total]),
		yieldEvery: 8,
		yieldWork: async () => {
			yieldReceipts.push(yieldReceipts.length + 1);
		}
	});
	assert.deepEqual(cooperative.vertices, synchronous.vertices);
	assert.deepEqual(cooperative.uvs, synchronous.uvs);
	assert.deepEqual(cooperative.indices, synchronous.indices);
	assert.deepEqual(cooperative.normals, synchronous.normals);
	assert.deepEqual(cooperative.zones, synchronous.zones);
	assert.equal(cooperative.colliders.length, synchronous.colliders.length);
	assert.equal(cooperative.preparation.mode, 'cooperative');
	assert.equal(cooperative.preparation.yields, yieldReceipts.length);
	assert.ok(yieldReceipts.length > 10);
	assert.deepEqual(progress.at(-1), [169, 169]);
});

test('full terrain retains density while publishing measured preparation evidence', () => {
	const terrain = createTerrainGeometry(80, 16);
	assert.equal(terrain.vertices.length, 289);
	assert.equal(terrain.colliders.length, 512);
	assert.equal(terrain.AwtsmoosTerrainValley.preparation.mode, 'synchronous');
	assert.ok(terrain.AwtsmoosTerrainValley.preparation.milliseconds >= 0);
});
