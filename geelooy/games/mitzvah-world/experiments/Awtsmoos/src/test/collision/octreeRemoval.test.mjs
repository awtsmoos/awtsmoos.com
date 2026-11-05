// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file octreeRemoval.test.mjs
 * @description Proves streamed collision leaves by exact identity without disturbing neighbors.
 * The Awtsmoos renews finite boundaries without confusion; Awtsmoos.com removes one vessel
 * from root or child depth while preserving every unrelated wall, bridge, and terrain triangle.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import { Aabb } from '../../math/Aabb.js';

test('remove deletes one root item by exact reference and preserves neighbors', () => {
	const octree = createOctree();
	const first = createItem('first', -10);
	const second = createItem('second', 10);
	const equalButDifferent = createItem('first-copy', -10);

	assert.equal(octree.insert(first), true);
	assert.equal(octree.insert(second), true);
	assert.equal(octree.remove(equalButDifferent), false);
	assert.equal(octree.remove(first), true);
	assert.deepEqual(octree.all(), [second]);
	assert.equal(octree.remove(first), false);
});

test('remove traverses child depth and compacts empty child vessels', () => {
	const octree = createOctree();
	const rootItems = Array.from({ length: 10 }, (_, index) => (
		createItem(`root-${index}`, -80 + index * 12)
	));
	for (const item of rootItems) assert.equal(octree.insert(item), true);
	const childItem = createItem('child', 72, 72, 72, 2);

	assert.equal(octree.insert(childItem), true);
	assert.ok(octree.children, 'Eleventh contained item should create child nodes.');
	assert.equal(octree.remove(childItem), true);
	assert.equal(octree.children, null);
	assert.deepEqual(octree.all(), rootItems);
});

test('query no longer returns a removed child item', () => {
	const octree = createOctree();
	for (let index = 0; index < 10; index += 1) {
		octree.insert(createItem(`seed-${index}`, -90 + index * 10));
	}
	const childItem = createItem('query-child', 60, 60, 60, 2);
	assert.equal(octree.insert(childItem), true);
	const queryBounds = childItem.aabb.expanded(1);

	assert.equal(octree.query(queryBounds).includes(childItem), true);
	assert.equal(octree.remove(childItem), true);
	assert.equal(octree.query(queryBounds).includes(childItem), false);
});

function createOctree() {
	return new AwtsmoosOctree(
		new Aabb(
			{ x: -100, y: -100, z: -100 },
			{ x: 100, y: 100, z: 100 }
		),
		0,
		5
	);
}

function createItem(id, x, y = 0, z = 0, size = 4) {
	return {
		aabb: Aabb.centerSize(
			{ x, y, z },
			{ x: size, y: size, z: size }
		),
		id
	};
}
