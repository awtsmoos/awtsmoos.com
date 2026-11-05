// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionEntry.test.mjs
 * @description Proves one octree becomes exact immutable deterministic ownership.
 * The Awtsmoos renews safe geometry; Awtsmoos.com rejects malformed bounds before
 * validation or active handoff can reveal them beneath the living world.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	activateWorldChunkCollisionEntry,
	createWorldChunkCollisionEntry,
	serializeWorldChunkCollisionEntry,
	validateWorldChunkCollisionEntry
} from '../../world/streaming/WorldChunkCollisionEntry.js';
import { WORLD_CHUNK_COLLISION_STATES as C } from '../../world/streaming/WorldChunkCollisionState.js';
import {
	collisionBounds,
	collisionDefinition,
	collisionOctree
} from './WorldChunkCollisionTestFixture.mjs';

test('entry copies exact bounds and derives triangle count', () => {
	const bounds = collisionBounds({ minimum: -8, maximum: 12 });
	const octree = collisionOctree({ bounds, triangleCount: 7 });
	const entry = createWorldChunkCollisionEntry(collisionDefinition({ octree }));
	assert.equal(entry.state, C.PREPARED);
	assert.deepEqual(entry.bounds, bounds);
	assert.equal(entry.triangleCount, 7);
	assert.equal(entry.runtime.octree, octree);
	assert.equal(Object.isFrozen(entry.bounds), true);
});

test('expected bounds mismatch is rejected', () => {
	const octree = collisionOctree({
		bounds: collisionBounds({ minimum: 0, maximum: 10 })
	});
	assert.throws(
		() => createWorldChunkCollisionEntry(collisionDefinition({
			octree,
			expectedBounds: collisionBounds({ minimum: 0, maximum: 11 })
		})),
		/Collision bounds mismatch/
	);
});

test('validation and activation preserve explicit deterministic evidence', () => {
	const prepared = createWorldChunkCollisionEntry(collisionDefinition());
	const validated = validateWorldChunkCollisionEntry(prepared, {
		at: 50,
		name: 'seam-validator',
		reason: 'bounds and triangles passed'
	});
	const active = activateWorldChunkCollisionEntry(validated, 'handoff-1', 75);
	assert.equal(prepared.state, C.PREPARED);
	assert.equal(validated.state, C.VALIDATED);
	assert.deepEqual(validated.validation, {
		at: 50,
		name: 'seam-validator',
		reason: 'bounds and triangles passed'
	});
	assert.equal(active.state, C.ACTIVE);
	assert.deepEqual(active.handoff, {
		id: 'handoff-1',
		activatedAt: 75
	});
	assert.equal(Object.isFrozen(active), true);
});

test('default evidence time is deterministic zero', () => {
	const prepared = createWorldChunkCollisionEntry(collisionDefinition());
	const validated = validateWorldChunkCollisionEntry(prepared);
	const active = activateWorldChunkCollisionEntry(validated, 'default-time');
	assert.equal(validated.validation.at, 0);
	assert.equal(active.handoff.activatedAt, 0);
});

test('serialization omits the live octree', () => {
	const entry = createWorldChunkCollisionEntry(collisionDefinition());
	const serialized = serializeWorldChunkCollisionEntry(entry);
	assert.equal('runtime' in serialized, false);
	assert.equal(serialized.triangleCount, entry.triangleCount);
	assert.deepEqual(serialized.bounds, entry.bounds);
});

test('malformed octrees and nonpositive bounds are rejected', () => {
	assert.throws(
		() => createWorldChunkCollisionEntry(collisionDefinition({ octree: {} })),
		/requires an octree/
	);
	const zeroWidth = collisionBounds({
		min: { x: 2, y: 0, z: 0 },
		max: { x: 2, y: 10, z: 10 }
	});
	assert.throws(
		() => createWorldChunkCollisionEntry(collisionDefinition({
			octree: collisionOctree({ bounds: zeroWidth })
		})),
		/min < max on x/
	);
});
