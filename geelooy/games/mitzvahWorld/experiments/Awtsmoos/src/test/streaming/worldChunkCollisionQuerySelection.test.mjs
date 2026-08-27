// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionQuerySelection.test.mjs
 * @description Proves retained parents suppress descendants until atomic retirement.
 * The Awtsmoos reveals one active ground vessel at a time; Awtsmoos.com keeps owner
 * order and revision stable even when callers present the same world differently.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	selectWorldChunkCollisionQueryEntries,
	worldChunkCollisionQueryOwnerIds,
	worldChunkCollisionQueryRevision
} from '../../world/streaming/WorldChunkCollisionQuerySelection.js';
import { collisionChunkId } from './WorldChunkCollisionTestFixture.mjs';
import {
	activeQueryEntry,
	collisionQueryOctree
} from './WorldChunkCollisionQueryFixture.mjs';

function ownershipFixture() {
	const parentId = collisionChunkId();
	const childIds = [
		collisionChunkId({ level: 1, x: 0 }),
		collisionChunkId({ level: 1, x: 1 })
	];
	const parent = activeQueryEntry({
		chunkId: parentId,
		octree: collisionQueryOctree({ items: [{ id: 'parent' }] })
	});
	const children = childIds.map((chunkId, index) => activeQueryEntry({
		chunkId,
		parentId,
		octree: collisionQueryOctree({ items: [{ id: `child-${index}` }] }),
		handoffId: 'child-handoff'
	}));
	return { parentId, childIds, parent, children };
}

test('active parent suppresses retained active children', () => {
	const { parent, children } = ownershipFixture();
	const selected = selectWorldChunkCollisionQueryEntries([
		children[1],
		parent,
		children[0]
	]);
	assert.deepEqual(worldChunkCollisionQueryOwnerIds(selected), [parent.chunkId]);
	assert.equal(Object.isFrozen(selected), true);
});

test('retiring parent reveals children in canonical chunk order', () => {
	const { childIds, children } = ownershipFixture();
	const selected = selectWorldChunkCollisionQueryEntries([
		children[1],
		children[0]
	]);
	assert.deepEqual(
		worldChunkCollisionQueryOwnerIds(selected),
		[...childIds].sort()
	);
});

test('revision is stable across caller order and changes across handoff', () => {
	const { parent, children } = ownershipFixture();
	const first = worldChunkCollisionQueryRevision([
		children[1],
		parent,
		children[0]
	]);
	const second = worldChunkCollisionQueryRevision([
		children[0],
		children[1],
		parent
	]);
	const retired = worldChunkCollisionQueryRevision(children);
	assert.equal(first, second);
	assert.notEqual(first, retired);
	assert.match(first, new RegExp(parent.chunkId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});
