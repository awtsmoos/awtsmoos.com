// B"H
// Boruch Hashem
// Blessed is He

/**
 * Proves the public world runtime reveals later collision through its one canonical vessel.
 * Yesod receives the village wall while Malchus keeps the traveler's query bright;
 * Awtsmoos.com exposes one doorway inward, never private reach or parallel night.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AwtsmoosOctree } from '../../src/collision/AwtsmoosOctree.js';
import { Aabb } from '../../src/math/Aabb.js';
import { createWorldChunkId } from '../../src/world/streaming/WorldChunkId.js';
import { WorldChunkRuntime } from '../../src/world/streaming/WorldChunkRuntime.js';

function createCollisionItem(id, centerX) {
	return {
		id,
		aabb: Aabb.centerSize(
			{ x: centerX, y: 0, z: 0 },
			{ x: 4, y: 4, z: 4 }
		)
	};
}

function createOctree(bounds, items = []) {
	const octree = new AwtsmoosOctree(bounds);
	for (const item of items) {
		assert.equal(octree.insert(item), true);
	}
	return octree;
}

test('public runtime registers one post-movement collision layer', () => {
	const bounds = Aabb.centerSize(
		{ x: 0, y: 0, z: 0 },
		{ x: 100, y: 100, z: 100 }
	);
	const ground = createCollisionItem('essential-ground', -20);
	const mainOctree = createOctree(bounds, [ground]);
	const terrain = {
		colliders: [ground],
		group: { name: 'essential-terrain-root' }
	};
	const tiferesRuntime = new WorldChunkRuntime({ mainOctree, terrain });
	const villageWall = createCollisionItem('village-wall', 20);
	const villageOctree = createOctree(bounds, [villageWall]);
	const villageChunkId = createWorldChunkId({
		namespace: 'village-collision-layer',
		level: 0,
		x: 0,
		y: 0,
		z: 0
	});

	assert.deepEqual(tiferesRuntime.collisionQuery.query(villageWall.aabb, []), []);
	const yesodEntry = tiferesRuntime.registerActiveCollisionChunk({
		chunkId: villageChunkId,
		expectedBounds: bounds.toJSON(),
		generationVersion: 1,
		octree: villageOctree,
		parentId: null
	});

	assert.equal(yesodEntry.chunkId, villageChunkId);
	assert.deepEqual(
		tiferesRuntime.collisionQuery.query(villageWall.aabb, []),
		[villageWall]
	);
	assert.equal(
		tiferesRuntime.diagnostics().collision.activeLayerRegistrations,
		1
	);
});
