// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionBoundaryContinuity.test.mjs
 * @description Proves real octrees preserve capsule, ground, and camera continuity.
 * The Awtsmoos joins neighboring vessels without a tear; Awtsmoos.com tests the
 * left epsilon, exact seam, and right epsilon through the custom collision engine.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { clipCameraEye } from '../../camera/CameraClipSystem.js';
import { AwtsmoosCollisionMover } from '../../collision/AwtsmoosCollisionMover.js';
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { Aabb } from '../../math/Aabb.js';
import { Vec3 } from '../../math/Vec3.js';
import { WorldGround } from '../../world/WorldGround.js';
import { WorldChunkCollisionQueryFacade } from '../../world/streaming/WorldChunkCollisionQueryFacade.js';
import { collisionChunkId } from './WorldChunkCollisionTestFixture.mjs';
import {
	activeQueryEntry,
	collisionQueryIndex
} from './WorldChunkCollisionQueryFixture.mjs';

const SEAM_SAMPLES = [-0.001, 0, 0.001];

test('downward ground rays preserve the same floor height across the seam', () => {
	const facade = createBoundaryFacade();
	const ground = new WorldGround({
		terrainHeightAt: () => -2,
		octree: facade,
		top: 4
	});
	const heights = SEAM_SAMPLES.map((x) => ground.heightAt(x, 1, { maxY: 1 }));
	for (const height of heights) {
		assert.ok(Math.abs(height) < 1e-9);
	}
});

test('camera rays preserve the same clipped eye across the seam', () => {
	const facade = createBoundaryFacade();
	const clippedEyes = SEAM_SAMPLES.map((x) => clipCameraEye(
		{ x, y: 1.2, z: 2 },
		{ x, y: 1.2, z: -2 },
		facade,
		0.2
	));
	for (const clipped of clippedEyes) {
		assert.ok(clipped.hit);
		assert.ok(Math.abs(clipped.eye.z - 0.42) < 1e-9);
	}
});

test('capsule movement resolves to one continuous wall plane across the seam', () => {
	const facade = createBoundaryFacade();
	const resolved = SEAM_SAMPLES.map((x) => {
		const mover = new AwtsmoosCollisionMover({ octree: facade });
		const position = { x, y: 0, z: 0.7 };
		const result = mover.move(
			position,
			{ x: 0, y: 0, z: -0.6 },
			{ grounded: false, floorY: 0, maxStepHeight: 0.3 }
		);
		assert.ok(result.contacts > 0);
		return position.z;
	});
	assert.ok(Math.min(...resolved) > 0.35);
	assert.ok(Math.max(...resolved) - Math.min(...resolved) < 0.01);
});

function createBoundaryFacade() {
	const entries = [
		createBoundaryEntry(-4, 0, 0),
		createBoundaryEntry(0, 4, 1)
	];
	return new WorldChunkCollisionQueryFacade(collisionQueryIndex(entries));
}

function createBoundaryEntry(minimumX, maximumX, xIndex) {
	const bounds = new Aabb(
		{ x: minimumX, y: -1, z: -4 },
		{ x: maximumX, y: 4, z: 4 }
	);
	const octree = new AwtsmoosOctree(bounds);
	for (const triangle of boundaryTriangles(minimumX, maximumX)) {
		assert.equal(octree.insert(triangle), true);
	}
	return activeQueryEntry({
		chunkId: collisionChunkId({ level: 1, x: xIndex }),
		octree
	});
}

function boundaryTriangles(minimumX, maximumX) {
	const floorNormal = new Vec3(0, 1, 0);
	const wallNormal = new Vec3(0, 0, 1);
	return [
		...quadTriangles(
			new Vec3(minimumX, 0, -4),
			new Vec3(maximumX, 0, -4),
			new Vec3(maximumX, 0, 4),
			new Vec3(minimumX, 0, 4),
			{ kind: 'seam-floor', floor: true, normal: floorNormal }
		),
		...quadTriangles(
			new Vec3(minimumX, 0, 0),
			new Vec3(maximumX, 0, 0),
			new Vec3(maximumX, 3, 0),
			new Vec3(minimumX, 3, 0),
			{ kind: 'seam-wall', floor: false, normal: wallNormal }
		)
	];
}

function quadTriangles(a, b, c, d, options) {
	return [
		new TriangleCollider(a, b, c, options),
		new TriangleCollider(a, c, d, options)
	];
}
