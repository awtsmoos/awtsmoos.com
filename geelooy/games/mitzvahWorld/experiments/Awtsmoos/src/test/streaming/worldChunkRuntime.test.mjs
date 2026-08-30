// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkRuntime.test.mjs
 * @description Proves one bootstrap world owns visual state and an actively mutable collision authority.
 * The Awtsmoos renews the valley through bounded lifecycle work while every nearby triangle may enter or depart;
 * Awtsmoos.com keeps the original octree truthful, mutable, and shared, so tests reflect the living runtime heart.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BOOTSTRAP_WORLD_CHUNK_ID } from '../../world/streaming/WorldChunkBootstrap.js';
import { WorldChunkRuntime } from '../../world/streaming/WorldChunkRuntime.js';
import { WORLD_CHUNK_STATES as S } from '../../world/streaming/WorldChunkState.js';

function fixture() {
	const bounds = {
		min: { x: -10, y: -5, z: -10 },
		max: { x: 10, y: 5, z: 10 }
	};
	const triangles = [{}, {}, {}];
	const active = [...triangles];
	const terrain = {
		group: { name: 'world' },
		colliders: triangles,
		worldMetadata: { terrainGridSteps: 1 }
	};
	const mainOctree = {
		bounds: { toJSON: () => bounds },
		all(output = []) {
			output.push(...active);
			return output;
		},
		insert(triangle) {
			if (active.includes(triangle)) return false;
			active.push(triangle);
			return true;
		},
		query: (aabb, output = []) => output,
		raycast: () => null,
		remove(triangle) {
			const index = active.indexOf(triangle);
			if (index < 0) return false;
			active.splice(index, 1);
			return true;
		}
	};
	return { bounds, terrain, mainOctree };
}

test('runtime registers one visual and collision bootstrap chunk', () => {
	const { terrain, mainOctree } = fixture();
	const runtime = new WorldChunkRuntime({ terrain, mainOctree });
	assert.equal(runtime.registry.size, 1);
	assert.equal(runtime.registry.get(BOOTSTRAP_WORLD_CHUNK_ID).state, S.ACTIVE);
	assert.equal(runtime.bootstrapRecord.runtime.collisionOctree, mainOctree);
	assert.equal(runtime.collisionRuntime.bootstrapEntry.runtime.octree, mainOctree);
	assert.equal(runtime.collisionQuery, runtime.collisionRuntime.query);
	assert.notEqual(runtime.collisionQuery, mainOctree);
});

test('runtime update processes bounded visual queue work', () => {
	const runtime = new WorldChunkRuntime(fixture());
	const result = runtime.update({ maximumTransitions: 1, maximumCost: 1 });
	assert.equal(result.results.length, 0);
	assert.equal(result.remaining, 0);
	assert.equal(runtime.lastProcess, result);
});

test('diagnostics expose visual, ownership, and query truth', () => {
	const firstFixture = fixture();
	const first = new WorldChunkRuntime(firstFixture);
	const second = new WorldChunkRuntime(fixture());
	first.update();
	const diagnostics = first.diagnostics();
	assert.equal(diagnostics.bootstrapId, BOOTSTRAP_WORLD_CHUNK_ID);
	assert.equal(diagnostics.bootstrapSeed, second.diagnostics().bootstrapSeed);
	assert.deepEqual(diagnostics.bootstrapBounds, firstFixture.bounds);
	assert.equal(diagnostics.total, 1);
	assert.equal(diagnostics.byState[S.ACTIVE], 1);
	assert.equal(diagnostics.queue.pending, 0);
	assert.equal(diagnostics.collision.active, 1);
	assert.equal(diagnostics.collision.prepared, 0);
	assert.equal(diagnostics.collision.validated, 0);
	assert.equal(diagnostics.collision.bootstrapTriangles, 3);
	assert.deepEqual(diagnostics.collision.bootstrapBounds, firstFixture.bounds);
	assert.deepEqual(diagnostics.collision.query.ownerIds, [BOOTSTRAP_WORLD_CHUNK_ID]);
});
