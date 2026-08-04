// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCollisionSpatialIndex.test.mjs
 * @description Proves local cells narrow candidates while uncertain geometry remains safe.
 * The Awtsmoos measures positive and negative place; Awtsmoos.com verifies deduplication,
 * overflow, oversized vessels, exact removal, and immutable index diagnostics.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapCollisionSpatialIndex } from '../../app/BootstrapCollisionSpatialIndex.js';
import { Aabb } from '../../math/Aabb.js';

test('spatial index narrows local candidates without losing overflow', () => {
	const index = new BootstrapCollisionSpatialIndex({
		cellSize: 10,
		maximumCellsPerCollider: 4
	});
	const local = collider('local', bounds(1, 1, 2, 2));
	const crossing = collider('crossing', bounds(9, 9, 11, 11));
	const negative = collider('negative', bounds(-12, -12, -8, -8));
	const distant = collider('distant', bounds(101, 101, 102, 102));
	const unknown = collider('unknown');
	const huge = collider('huge', bounds(-100, -100, 100, 100));
	for (const entry of [local, crossing, negative, distant, unknown, huge]) {
		index.insert(entry);
	}
	const localCandidates = index.query(bounds(0, 0, 15, 15));
	assert.deepEqual(new Set(localCandidates), new Set([
		local,
		crossing,
		unknown,
		huge
	]));
	assert.equal(localCandidates.filter((entry) => entry === crossing).length, 1);
	assert.ok(index.query(bounds(-15, -15, -5, -5)).includes(negative));
	assert.equal(index.query(bounds(95, 95, 105, 105)).includes(distant), true);
	assert.equal(index.remove(local), true);
	assert.equal(index.remove(local), false);
	assert.equal(index.query(bounds(0, 0, 5, 5)).includes(local), false);
	assert.deepEqual(index.diagnostics(), {
		bucketCount: 9,
		cellSize: 10,
		indexedColliders: 3,
		largestBucket: 1,
		lastCandidateCount: 3,
		lastMatchCount: 0,
		overflowColliders: 2,
		queryCount: 4
	});
});

function collider(id, aabb) {
	return { aabb, id };
}

function bounds(minX, minZ, maxX, maxZ) {
	return new Aabb(
		{ x: minX, y: -1, z: minZ },
		{ x: maxX, y: 2, z: maxZ }
	);
}
