// B"H
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { Aabb } from '../../math/Aabb.js';

/** Builds parent, child, filtered, and malformed collision faces deterministically. */
export function createOctreeRaycastFixture() {
	const octree = new AwtsmoosOctree(
		new Aabb(
			{ x: 0, y: 0, z: 0 },
			{ x: 20, y: 20, z: 20 }
		),
		0,
		2
	);
	const invalid = createInvalidTriangle();
	const near = createPlaneTriangle(4, 1, 1, 'near-wall');
	const fillers = Array.from(
		{ length: 8 },
		(_, index) => createPlaneTriangle(
			6 + index * 0.2,
			15,
			15,
			`filler-${index}`
		)
	);
	const far = createPlaneTriangle(12, 1, 1, 'far-wall');
	for (const item of [invalid, near, ...fillers, far]) octree.insert(item);
	return {
		octree,
		invalid,
		near,
		far,
		fillers,
		rayOrigin: { x: 0, y: 1, z: 1 },
		rayDirection: { x: 1, y: 0, z: 0 }
	};
}

export function createPlaneTriangle(x, y, z, kind, size = 0.5) {
	return new TriangleCollider(
		{ x, y: y - size, z: z - size },
		{ x, y: y + size, z: z - size },
		{ x, y, z: z + size },
		{ kind }
	);
}

function createInvalidTriangle() {
	const invalidPoint = { x: NaN, y: NaN, z: NaN };
	return {
		a: invalidPoint,
		b: invalidPoint,
		c: invalidPoint,
		normal: invalidPoint,
		kind: 'invalid-garden-bed',
		solid: true,
		floor: false,
		aabb: new Aabb(
			{ x: 0, y: 0.5, z: 0.5 },
			{ x: 0.1, y: 1.5, z: 1.5 }
		)
	};
}
