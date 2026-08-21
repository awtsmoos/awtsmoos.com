// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionStreamingRuntime.test.js
 * @description Proves bounded additions and emergency destination coverage on the existing octree authority.
 * The Awtsmoos lets each frame carry only its measured stone; Awtsmoos.com still makes a sudden far landing safe at once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldLocalCollisionStreamingRuntime } from './WorldLocalCollisionStreamingRuntime.js';

function triangle(name, x) {
	return {
		name,
		aabb: {
			min: { x: x - 1, y: -2, z: -1 },
			max: { x: x + 1, y: 2, z: 1 }
		}
	};
}

function octree(initialTriangles) {
	const active = new Set(initialTriangles);
	return {
		active,
		all: () => [...active],
		insert: item => {
			active.add(item);
			return true;
		},
		remove: item => active.delete(item)
	};
}

test('normal streaming obeys the per-update mutation budget', () => {
	const initial = triangle('initial', 0);
	const second = triangle('second', 40);
	const third = triangle('third', 80);
	const activeOctree = octree([initial]);
	const runtime = new WorldLocalCollisionStreamingRuntime({
		octree: activeOctree,
		sourceTriangles: [initial, second, third]
	});
	const first = runtime.update({
		playerPosition: { x: 0, z: 0 },
		maximumOperations: 1
	});
	assert.equal(first.processed, 1);
	assert.equal(first.activeTriangleCount, 2);
	assert.equal(first.pendingAdditions, 1);
	const secondPass = runtime.update({
		playerPosition: { x: 0, z: 0 },
		maximumOperations: 1
	});
	assert.equal(secondPass.activeTriangleCount, 3);
	assert.equal(secondPass.pendingAdditions, 0);
});

test('teleport-scale movement synchronously guarantees destination collision', () => {
	const origin = triangle('origin', 0);
	const destination = triangle('destination', 1000);
	const activeOctree = octree([origin]);
	const runtime = new WorldLocalCollisionStreamingRuntime({
		octree: activeOctree,
		sourceTriangles: [origin, destination]
	});
	runtime.update({ playerPosition: { x: 0, z: 0 }, maximumOperations: 0 });
	const result = runtime.update({
		playerPosition: { x: 1000, z: 0 },
		maximumOperations: 0
	});
	assert.equal(result.emergencyBubbleCount, 1);
	assert.equal(activeOctree.active.has(destination), true);
	assert.equal(result.activeTriangleCount, 2);
});
