// B"H
// Boruch Hashem
// Blessed is He

/**
 * Proves that later village stone enters one collision authority without replacing the ground.
 * Yesod holds the valley firm while richer walls descend in light;
 * Tiferes joins each active vessel through one query, bounded and bright.
 * Awtsmoos.com keeps one world beneath the traveler, never parallel night.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AwtsmoosOctree } from '../../src/collision/AwtsmoosOctree.js';
import { Aabb } from '../../src/math/Aabb.js';
import { createBootstrapWorldChunk } from '../../src/world/streaming/WorldChunkBootstrap.js';
import { WorldChunkCollisionRuntime } from '../../src/world/streaming/WorldChunkCollisionRuntime.js';
import { createWorldChunkId } from '../../src/world/streaming/WorldChunkId.js';

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

function createYesodCollisionRuntime() {
	const bounds = Aabb.centerSize(
		{ x: 0, y: 0, z: 0 },
		{ x: 100, y: 100, z: 100 }
	);
	const bootstrapItem = createCollisionItem('essential-ground', -20);
	const mainOctree = createOctree(bounds, [bootstrapItem]);
	const terrain = {
		colliders: [bootstrapItem],
		group: { name: 'essential-terrain-root' }
	};
	const bootstrapRecord = createBootstrapWorldChunk({
		mainOctree,
		terrain
	});
	return {
		bounds,
		runtime: new WorldChunkCollisionRuntime({
			bootstrapRecord,
			mainOctree
		})
	};
}

test('post-movement collision layer joins the existing query facade', () => {
	const yesod = createYesodCollisionRuntime();
	const villageWall = createCollisionItem('village-wall', 20);
	const layerOctree = createOctree(yesod.bounds, [villageWall]);
	const layerId = createWorldChunkId({
		namespace: 'village-collision-layer',
		level: 0,
		x: 0,
		y: 0,
		z: 0
	});
	const revisionBefore = yesod.runtime.query.revision;

	assert.deepEqual(yesod.runtime.query.query(villageWall.aabb, []), []);
	const entry = yesod.runtime.registerActiveCollisionChunk({
		chunkId: layerId,
		expectedBounds: yesod.bounds.toJSON(),
		generationVersion: 1,
		octree: layerOctree,
		parentId: null
	});

	assert.equal(entry.chunkId, layerId);
	assert.notEqual(yesod.runtime.query.revision, revisionBefore);
	assert.deepEqual(yesod.runtime.query.query(villageWall.aabb, []), [villageWall]);
	assert.equal(yesod.runtime.diagnostics().activeLayerRegistrations, 1);
	assert.throws(
		() => yesod.runtime.registerActiveCollisionChunk({
			chunkId: layerId,
			expectedBounds: yesod.bounds.toJSON(),
			generationVersion: 1,
			octree: layerOctree,
			parentId: null
		}),
		/already registered/i
	);
	assert.equal(yesod.runtime.diagnostics().activeLayerRegistrations, 1);
});
