// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionQueryFacade.test.mjs
 * @description Proves snapshot isolation, duplicate removal, rays, and revisions.
 * The Awtsmoos reveals one collision answer through accepted owners; Awtsmoos.com
 * measures that answer without mixing parent and child worlds or repeated snapshots.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldChunkCollisionQueryFacade } from '../../world/streaming/WorldChunkCollisionQueryFacade.js';
import { collisionChunkId } from './WorldChunkCollisionTestFixture.mjs';
import {
	activeQueryEntry,
	clonedBoundaryTriangle,
	collisionQueryIndex,
	collisionQueryOctree,
	collisionRayHit
} from './WorldChunkCollisionQueryFixture.mjs';

test('one query snapshot suppresses retained children and preserves caller output', () => {
	const parentId = collisionChunkId();
	const childId = collisionChunkId({ level: 1, x: 0 });
	const parentItem = { id: 'parent-item' };
	const childItem = { id: 'child-item' };
	const parentOctree = collisionQueryOctree({ items: [parentItem] });
	const childOctree = collisionQueryOctree({ items: [childItem] });
	const index = collisionQueryIndex([
		activeQueryEntry({ chunkId: childId, parentId, octree: childOctree }),
		activeQueryEntry({ chunkId: parentId, octree: parentOctree })
	]);
	const facade = new WorldChunkCollisionQueryFacade(index);
	const seed = { id: 'existing-output' };
	const output = facade.query({}, [seed]);
	assert.deepEqual(output, [seed, parentItem]);
	assert.equal(parentOctree.calls.query, 1);
	assert.equal(childOctree.calls.query, 0);
	assert.equal(index.snapshotCount, 1);
	assert.equal(facade.evidence.lastOperation.unique, 1);
});

test('query and all remove cloned sibling-boundary triangles', () => {
	const firstTriangle = clonedBoundaryTriangle();
	const secondTriangle = clonedBoundaryTriangle();
	const entries = [0, 1].map((x, index) => activeQueryEntry({
		chunkId: collisionChunkId({ level: 1, x }),
		octree: collisionQueryOctree({
			items: [index === 0 ? firstTriangle : secondTriangle]
		})
	}));
	const facade = new WorldChunkCollisionQueryFacade(collisionQueryIndex(entries));
	assert.deepEqual(facade.query({}), [firstTriangle]);
	assert.deepEqual(facade.all(), [firstTriangle]);
	const diagnostics = facade.diagnostics();
	assert.equal(diagnostics.stats.duplicatesRemoved, 2);
	assert.equal(diagnostics.lastOperation.duplicatesRemoved, 1);
	assert.equal(Object.isFrozen(diagnostics), true);
});

test('raycast chooses nearest hit and canonical owner on exact ties', () => {
	const firstId = collisionChunkId({ level: 1, x: 0 });
	const secondId = collisionChunkId({ level: 1, x: 1 });
	const firstHit = collisionRayHit(2, 'canonical-first');
	const secondHit = collisionRayHit(1, 'nearest-second');
	const first = activeQueryEntry({
		chunkId: firstId,
		octree: collisionQueryOctree({ hit: firstHit })
	});
	const secondOctree = collisionQueryOctree({ hit: secondHit });
	const second = activeQueryEntry({ chunkId: secondId, octree: secondOctree });
	const index = collisionQueryIndex([second, first]);
	const facade = new WorldChunkCollisionQueryFacade(index);
	assert.equal(facade.raycast({}, 10).kind, 'nearest-second');
	secondOctree.raycast = () => collisionRayHit(2, 'canonical-second');
	assert.equal(facade.raycast({}, 10).kind, 'canonical-first');
});

test('revision changes when accepted active ownership changes', () => {
	const parent = activeQueryEntry({ chunkId: collisionChunkId() });
	const child = activeQueryEntry({
		chunkId: collisionChunkId({ level: 1, x: 0 }),
		parentId: parent.chunkId,
		handoffId: 'child-active'
	});
	const index = collisionQueryIndex([parent, child]);
	const facade = new WorldChunkCollisionQueryFacade(index);
	const retainedRevision = facade.revision;
	index.setEntries([child]);
	assert.notEqual(facade.revision, retainedRevision);
	assert.deepEqual(facade.diagnostics().ownerIds, [child.chunkId]);
});
