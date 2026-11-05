// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionTriangleBounds.test.mjs
 * @description Proves planar bounds, finite validation, and closed child contact.
 * The Awtsmoos preserves a face even where one dimension vanishes; Awtsmoos.com
 * therefore treats exact faces, edges, and corners as real collision assignments.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { Vec3 } from '../../math/Vec3.js';
import {
	collisionBoundsClosedOverlap,
	createWorldChunkCollisionTriangleBounds
} from '../../world/streaming/WorldChunkCollisionTriangleBounds.js';

test('planar triangle bounds preserve zero thickness', () => {
	const triangle = createTriangle(
		new Vec3(0, -2, -3),
		new Vec3(0, 4, -1),
		new Vec3(0, 1, 5)
	);
	const bounds = createWorldChunkCollisionTriangleBounds(triangle);
	assert.deepEqual(bounds, {
		min: { x: 0, y: -2, z: -3 },
		max: { x: 0, y: 4, z: 5 }
	});
	assert.equal(Object.isFrozen(bounds), true);
});

test('closed overlap includes face, edge, and corner contact', () => {
	const left = box(-2, -2, -2, 0, 0, 0);
	assert.equal(
		collisionBoundsClosedOverlap(left, box(0, -1, -1, 2, 1, 1)),
		true
	);
	assert.equal(
		collisionBoundsClosedOverlap(left, box(0, 0, -1, 2, 2, 1)),
		true
	);
	assert.equal(
		collisionBoundsClosedOverlap(left, box(0, 0, 0, 2, 2, 2)),
		true
	);
	assert.equal(
		collisionBoundsClosedOverlap(left, box(0.001, 0, 0, 2, 2, 2)),
		false
	);
});

test('non-finite triangle vertices and malformed bounds are rejected', () => {
	assert.throws(
		() => createWorldChunkCollisionTriangleBounds({
			a: { x: 0, y: 0, z: 0 },
			b: { x: Infinity, y: 0, z: 0 },
			c: { x: 0, y: 1, z: 0 }
		}),
		/finite triangle vertices/
	);
	assert.throws(
		() => collisionBoundsClosedOverlap(
			box(0, 0, 0, 1, 1, 1),
			{ min: {}, max: {} }
		),
		/finite min and max/
	);
});

function createTriangle(a, b, c) {
	return new TriangleCollider(a, b, c, {
		kind: 'bounds-test',
		floor: false,
		normal: new Vec3(1, 0, 0)
	});
}

function box(minX, minY, minZ, maxX, maxY, maxZ) {
	return {
		min: { x: minX, y: minY, z: minZ },
		max: { x: maxX, y: maxY, z: maxZ }
	};
}
