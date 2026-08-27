// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionGeneratedFixture.mjs
 * @description Builds stable parent geometry for child-octree and seam acceptance.
 * The Awtsmoos reveals one floor and wall through eight vessels; Awtsmoos.com keeps
 * their bounds, identities, normals, and generation inputs identical across every test.
 */
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { Vec3 } from '../../math/Vec3.js';
import { createWorldChunkCollisionChildOctrees } from '../../world/streaming/WorldChunkCollisionChildOctreeFactory.js';
import { createWorldChunkId } from '../../world/streaming/WorldChunkId.js';

export const GENERATED_PARENT_BOUNDS = Object.freeze({
	min: Object.freeze({ x: -4, y: -1, z: -4 }),
	max: Object.freeze({ x: 4, y: 3, z: 4 })
});

export const GENERATED_PARENT_ID = createWorldChunkId({
	namespace: 'generated-boundary',
	level: 0,
	x: 0,
	y: 0,
	z: 0
});

/** Returns the canonical floor and wall triangles spanning the child seams. */
export function createGeneratedBoundaryTriangles() {
	return [
		...quadTriangles(
			new Vec3(-4, 0, -4),
			new Vec3(4, 0, -4),
			new Vec3(4, 0, 4),
			new Vec3(-4, 0, 4),
			{ kind: 'generated-floor', floor: true, normal: new Vec3(0, 1, 0) }
		),
		...quadTriangles(
			new Vec3(-4, 0, 0),
			new Vec3(4, 0, 0),
			new Vec3(4, 3, 0),
			new Vec3(-4, 3, 0),
			{ kind: 'generated-wall', floor: false, normal: new Vec3(0, 0, 1) }
		)
	];
}

/** Returns one deterministic real child-octree generation result. */
export function createGeneratedBoundaryChildren({ reverse = false } = {}) {
	const triangles = createGeneratedBoundaryTriangles();
	return createWorldChunkCollisionChildOctrees({
		parentId: GENERATED_PARENT_ID,
		parentBounds: GENERATED_PARENT_BOUNDS,
		parentSeed: 314159,
		generationVersion: 3,
		triangles: reverse ? triangles.reverse() : triangles
	});
}

function quadTriangles(a, b, c, d, options) {
	return [
		new TriangleCollider(a, b, c, options),
		new TriangleCollider(a, c, d, options)
	];
}
