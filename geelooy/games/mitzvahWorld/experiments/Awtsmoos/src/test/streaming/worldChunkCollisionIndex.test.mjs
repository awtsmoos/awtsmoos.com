// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkCollisionIndex.test.mjs
 * @description Proves active and prepared collision ownership remain distinct,
 * validated, discardable, and duplicate-safe before the Awtsmoos reveals handoff.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldChunkCollisionIndex } from '../../world/streaming/WorldChunkCollisionIndex.js';
import { WORLD_CHUNK_COLLISION_STATES as C } from '../../world/streaming/WorldChunkCollisionState.js';
import {
	collisionChunkId,
	collisionDefinition,
	collisionOctree
} from './WorldChunkCollisionTestFixture.mjs';

test('active and prepared registrations remain separately queryable', () => {
	const index = new WorldChunkCollisionIndex();
	const parentId = collisionChunkId();
	const childId = collisionChunkId({ level: 1, x: 1 });
	const active = index.registerActive(collisionDefinition({
		chunkId: parentId,
		octree: collisionOctree({ triangleCount: 8 })
	}));
	const prepared = index.prepare(collisionDefinition({
		chunkId: childId,
		parentId,
		octree: collisionOctree({ triangleCount: 3 })
	}));
	assert.equal(active.state, C.ACTIVE);
	assert.equal(prepared.state, C.PREPARED);
	assert.equal(index.getActive(parentId), active);
	assert.equal(index.getPrepared(childId), prepared);
	assert.equal(index.getActive(childId), null);
});

test('duplicate IDs are rejected across active and prepared maps', () => {
	const index = new WorldChunkCollisionIndex();
	const id = collisionChunkId();
	index.registerActive(collisionDefinition({ chunkId: id }));
	assert.throws(
		() => index.prepare(collisionDefinition({ chunkId: id })),
		/already registered/
	);
});

test('validation replaces only the prepared entry with evidence', () => {
	const index = new WorldChunkCollisionIndex();
	const id = collisionChunkId({ level: 1, x: 2 });
	index.prepare(collisionDefinition({ chunkId: id }));
	const validated = index.validate(id, {
		at: 90,
		name: 'prepared-index-validator',
		reason: 'ready'
	});
	assert.equal(validated.state, C.VALIDATED);
	assert.equal(index.getPrepared(id), validated);
	assert.equal(index.hasActive(id), false);
});

test('discard removes prepared ownership and preserves compact diagnostics', () => {
	const index = new WorldChunkCollisionIndex();
	const id = collisionChunkId({ level: 1, x: 3 });
	index.prepare(collisionDefinition({ chunkId: id }));
	const discarded = index.discardPrepared(id, {
		at: 100,
		reason: 'seam mismatch'
	});
	assert.equal(discarded.state, C.DISCARDED);
	assert.equal(index.hasPrepared(id), false);
	assert.deepEqual(index.diagnostics().lastDiscard, {
		chunkId: id,
		at: 100,
		reason: 'seam mismatch'
	});
});

test('diagnostics count active, prepared, validated, and triangles', () => {
	const index = new WorldChunkCollisionIndex();
	const parentId = collisionChunkId();
	const childId = collisionChunkId({ level: 1 });
	index.registerActive(collisionDefinition({
		chunkId: parentId,
		octree: collisionOctree({ triangleCount: 5 })
	}));
	index.prepare(collisionDefinition({
		chunkId: childId,
		parentId,
		octree: collisionOctree({ triangleCount: 2 })
	}));
	index.validate(childId);
	const diagnostics = index.diagnostics();
	assert.equal(diagnostics.active, 1);
	assert.equal(diagnostics.prepared, 1);
	assert.equal(diagnostics.validated, 1);
	assert.equal(diagnostics.activeTriangles, 5);
	assert.equal(diagnostics.preparedTriangles, 2);
});