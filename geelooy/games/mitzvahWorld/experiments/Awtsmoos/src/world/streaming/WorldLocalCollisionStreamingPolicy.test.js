// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionStreamingPolicy.test.js
 * @description Proves the tighter indexed prefetch, replanning, hysteresis, and teleport policy.
 * The Awtsmoos measures a smaller road ahead while keeping a wider guard behind;
 * Awtsmoos.com proves speed does not abandon safety when the streaming rings are refined.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldLocalCollisionSourceIndex } from './WorldLocalCollisionSourceIndex.js';
import {
	LOCAL_COLLISION_PREFETCH_DISTANCE,
	createLocalCollisionStreamingPlan,
	isLocalCollisionDiscontinuity,
	resolveLocalCollisionDirection,
	shouldReplanLocalCollision
} from './WorldLocalCollisionStreamingPolicy.js';

function triangle(name, x) {
	return {
		name,
		aabb: {
			min: { x: x - 1, y: -2, z: -1 },
			max: { x: x + 1, y: 2, z: 1 }
		}
	};
}

test('motion direction drives the compact ahead-of-player prefetch center', () => {
	const direction = resolveLocalCollisionDirection({ x: 0, z: 0 }, { x: 12, z: 0 });
	const near = triangle('near', 0);
	const ahead = triangle('ahead', 150);
	const farBehind = triangle('far-behind', -300);
	const sourceIndex = new WorldLocalCollisionSourceIndex({
		sourceTriangles: [near, ahead, farBehind]
	});
	const plan = createLocalCollisionStreamingPlan({
		activeTriangles: new Set([near, farBehind]),
		direction,
		position: { x: 12, z: 0 },
		sourceIndex
	});
	assert.equal(plan.center.x, 12 + LOCAL_COLLISION_PREFETCH_DISTANCE);
	assert.deepEqual(plan.additions.map(item => item.name), ['ahead']);
	assert.deepEqual(plan.removals.map(item => item.name), ['far-behind']);
});

test('replanning and teleport detection use tighter independent thresholds', () => {
	assert.equal(shouldReplanLocalCollision(null, { x: 0, z: 0 }), true);
	assert.equal(shouldReplanLocalCollision({ x: 0, z: 0 }, { x: 7, z: 0 }), false);
	assert.equal(shouldReplanLocalCollision({ x: 0, z: 0 }, { x: 8, z: 0 }), true);
	assert.equal(isLocalCollisionDiscontinuity({ x: 0, z: 0 }, { x: 47, z: 0 }), false);
	assert.equal(isLocalCollisionDiscontinuity({ x: 0, z: 0 }, { x: 48, z: 0 }), true);
});
