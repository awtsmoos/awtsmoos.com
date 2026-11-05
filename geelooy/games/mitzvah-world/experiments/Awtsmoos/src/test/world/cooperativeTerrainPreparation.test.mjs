// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWorldCollisionOctreeAsync } from '../../app/WorldCollisionOctree.js';
import { createTerrainGeometryAsync } from '../../world/TerrainGeometry.js';

test('terrain sampling, topology, collision, and normals yield cooperatively', async () => {
	let yields = 0;
	const geometry = await createTerrainGeometryAsync(48, 12, {
		yieldEvery: 16,
		yieldWork: async () => { yields += 1; }
	});
	assert.equal(geometry.indices.length / 3, 12 * 12 * 2);
	assert.equal(geometry.colliders.length, 12 * 12 * 2);
	assert.equal(geometry.normals.length, geometry.vertices.length * 3);
	assert.ok(yields > 5);
	assert.equal(geometry.preparation.mode, 'cooperative');
});

test('world collision insertion yields and returns a queryable octree', async () => {
	let yields = 0;
	const geometry = await createTerrainGeometryAsync(32, 8, {
		yieldEvery: 16,
		yieldWork: async () => {}
	});
	const octree = await buildWorldCollisionOctreeAsync(geometry.colliders, {
		batchSize: 64,
		yieldWork: async () => { yields += 1; }
	});
	assert.ok(octree);
	assert.ok(yields >= 2);
});
