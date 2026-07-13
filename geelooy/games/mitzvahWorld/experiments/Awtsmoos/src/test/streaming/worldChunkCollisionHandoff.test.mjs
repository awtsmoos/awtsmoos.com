// B"H // Boruch Hashem // Blessed is He
/**
 * @file worldChunkCollisionHandoff.test.mjs
 * @description Proves atomic child activation and explicitly timed retirement.
 * The Awtsmoos retains one ground until every vessel is ready; Awtsmoos.com
 * reveals complete bounds, volume, ownership, and sequence-time evidence.
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
function preparedIndex() {
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
		octree: collisionOctree({ bounds: parentBounds, triangleCount: 10 })
	}));
	for (const [childIndex, childId] of childIds.entries()) {
		index.prepare(collisionDefinition({
			chunkId: childId,
			parentId,
			octree: collisionOctree({
				bounds: childBounds[childIndex],
				triangleCount: childIndex + 2
			})
		}));
	}
	return { index, parentId, childIds, parentBounds };
}
function validateChildren(index, childIds) {
	for (const childId of childIds) {
		index.validate(childId);
	}
}

test('failed activation leaves both ownership maps unchanged', () => {
	const { index, parentId, childIds } = preparedIndex();
	index.validate(childIds[0]);
	const activeBefore = index.activeSnapshot();
	const preparedBefore = index.preparedSnapshot();
	assert.throws(() => index.activateReplacement({
		parentId,
		childIds,
		retainParent: false,
		handoffId: 'failed-handoff'
	}), /not validated/);
	assert.deepEqual(index.activeSnapshot(), activeBefore);
	assert.deepEqual(index.preparedSnapshot(), preparedBefore);
});

test('validated children activate while retaining the parent', () => {
	const { index, parentId, childIds, parentBounds } = preparedIndex();
	validateChildren(index, childIds);
	const handoff = index.activateReplacement({
		parentId,
		childIds,
		retainParent: true,
		handoffId: 'retained-parent',
		at: 40
	});
	assert.equal(index.hasActive(parentId), true);
	assert.equal(index.hasPrepared(childIds[0]), false);
	assert.equal(index.hasActive(childIds[0]), true);
	assert.equal(index.hasActive(childIds[1]), true);
	assert.equal(handoff.retainedParent, true);
	assert.equal(handoff.at, 40);
	assert.deepEqual(handoff.coverage.parentBounds, parentBounds);
	assert.equal(handoff.coverage.parentVolume, handoff.coverage.childVolume);
	assert.deepEqual(index.diagnostics().parentCoverage[parentId], childIds);
});

test('validated replacement may release the parent atomically', () => {
	const { index, parentId, childIds } = preparedIndex();
	validateChildren(index, childIds);
	index.activateReplacement({
		parentId,
		childIds,
		retainParent: false,
		handoffId: 'released-parent'
	});
	assert.equal(index.hasActive(parentId), false);
	assert.equal(index.hasActive(childIds[0]), true);
	assert.equal(index.hasActive(childIds[1]), true);
});

test('retained parent retires with complete children and explicit time', () => {
	const { index, parentId, childIds } = preparedIndex();
	validateChildren(index, childIds);
	index.activateReplacement({
		parentId,
		childIds,
		retainParent: true,
		handoffId: 'overlap-period'
	});
	const unknownId = collisionChunkId({ level: 1, x: 7 });
	assert.throws(() => index.retireActiveParent(
		parentId,
		[...childIds, unknownId],
		'invalid-retirement',
		87
	), /does not cover parent/);
	index.retireActiveParent(parentId, childIds, 'valid-retirement', 88);
	assert.equal(index.hasActive(parentId), false);
	assert.equal(index.diagnostics().lastHandoff.retainedParent, false);
	assert.equal(index.diagnostics().lastHandoff.at, 88);
});
