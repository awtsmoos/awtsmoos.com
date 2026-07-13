// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionDeterminism.test.mjs
 * @description Proves stable ordering, event time, diagnostics, and old snapshots.
 * The Awtsmoos recreates one coherent instant; Awtsmoos.com ensures identical
 * ownership inputs reveal identical durable truth independent of caller order.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldChunkCollisionIndex } from '../../world/streaming/WorldChunkCollisionIndex.js';
import {
	collisionBounds,
	collisionChunkId,
	collisionDefinition,
	collisionOctree,
	splitCollisionBoundsX
} from './WorldChunkCollisionTestFixture.mjs';

function readyIndex() {
	const index = new WorldChunkCollisionIndex();
	const parentId = collisionChunkId();
	const childIds = [
		collisionChunkId({ level: 1, x: 0 }),
		collisionChunkId({ level: 1, x: 1 })
	];
	const parentBounds = collisionBounds();
	const childBounds = splitCollisionBoundsX(parentBounds);
	index.registerActive(collisionDefinition({
		chunkId: parentId,
		octree: collisionOctree({ bounds: parentBounds, triangleCount: 8 })
	}));
	for (const [childIndex, childId] of childIds.entries()) {
		index.prepare(collisionDefinition({
			chunkId: childId,
			parentId,
			octree: collisionOctree({
				bounds: childBounds[childIndex],
				triangleCount: childIndex + 3
			})
		}));
		index.validate(childId);
	}
	return { index, parentId, childIds };
}

test('handoff canonicalizes child order and applies one explicit event time', () => {
	const { index, parentId, childIds } = readyIndex();
	const before = index.activeSnapshot();
	const handoff = index.activateReplacement({
		parentId,
		childIds: [...childIds].reverse(),
		retainParent: true,
		handoffId: 'canonical-handoff',
		at: 33
	});
	assert.deepEqual(handoff.childIds, [...childIds].sort());
	assert.equal(handoff.at, 33);
	for (const childId of childIds) {
		assert.equal(index.getActive(childId).handoff.activatedAt, 33);
	}
	assert.equal(Object.isFrozen(before), true);
	assert.deepEqual(before.map((entry) => entry.chunkId), [parentId]);
	assert.throws(() => before.push(index.getActive(childIds[0])), TypeError);
});

test('identical default-time runs produce identical diagnostics', () => {
	const first = readyIndex();
	const second = readyIndex();
	for (const fixture of [first, second]) {
		fixture.index.activateReplacement({
			parentId: fixture.parentId,
			childIds: [...fixture.childIds].reverse(),
			retainParent: false,
			handoffId: 'repeatable-handoff'
		});
	}
	assert.deepEqual(first.index.diagnostics(), second.index.diagnostics());
	assert.equal(first.index.diagnostics().lastHandoff.at, 0);
});
