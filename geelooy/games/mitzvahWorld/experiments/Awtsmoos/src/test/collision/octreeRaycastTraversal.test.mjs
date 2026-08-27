// B"H
import assert from 'node:assert/strict';
import { Aabb } from '../../math/Aabb.js';
import { Ray } from '../../math/Ray.js';
import { rayIntersectsAabb } from '../../math/RayAabb.js';
import { createOctreeRaycastFixture } from './OctreeRaycastFixtures.mjs';

const fixture = createOctreeRaycastFixture();
const ray = new Ray(fixture.rayOrigin, fixture.rayDirection);
const nearest = fixture.octree.raycast(ray, 20);

assert.equal(nearest?.item, fixture.near, 'nearest finite parent hit should win');
assert.equal(nearest?.distance, 4, 'nearest wall should remain four units away');
assert.ok(Number.isFinite(nearest?.point?.x), 'invalid triangle must not produce a hit');

const filtered = fixture.octree.raycast(
	ray,
	20,
	(item) => item.kind === 'far-wall'
);
assert.equal(filtered?.item, fixture.far, 'predicate should reveal child-owned far hit');
assert.equal(filtered?.distance, 12, 'child-owned wall should remain twelve units away');

assert.equal(
	fixture.octree.raycast(ray, 3),
	null,
	'maximum distance should reject the near wall'
);
assert.equal(
	fixture.octree.raycast(
		{ origin: fixture.rayOrigin, direction: fixture.rayDirection },
		20
	)?.item,
	fixture.near,
	'plain ray objects should retain compatibility'
);
assert.equal(
	fixture.octree.raycast(
		new Ray(fixture.rayOrigin, { x: 0, y: 0, z: 0 }),
		20
	),
	null,
	'zero-length rays should fail closed'
);
assert.equal(
	fixture.octree.raycast(
		new Ray({ x: -5, y: 25, z: 25 }, { x: 1, y: 0, z: 0 }),
		40
	),
	null,
	'a ray missing the root bounds should not inspect triangles'
);

const allItems = fixture.octree.all([]);
assert.equal(allItems.length, 11, 'all() should retain parent and child items');
assert.equal(allItems.at(-1), fixture.far, 'child traversal order should remain stable');

const farQuery = fixture.octree.query(new Aabb(
	{ x: 11.4, y: 0, z: 0 },
	{ x: 12.6, y: 2, z: 2 }
));
assert.deepEqual(farQuery, [fixture.far], 'query() should retain bounded child truth');

const box = new Aabb(
	{ x: 4, y: 0, z: 0 },
	{ x: 5, y: 2, z: 2 }
);
assert.equal(
	rayIntersectsAabb(fixture.rayOrigin, fixture.rayDirection, box, 20),
	true,
	'a forward ray should intersect a reachable box'
);
assert.equal(
	rayIntersectsAabb(fixture.rayOrigin, fixture.rayDirection, box, 3),
	false,
	'a box beyond the finite horizon should be rejected'
);
assert.equal(
	rayIntersectsAabb(
		{ x: 4, y: 1, z: 1 },
		{ x: 0, y: 1, z: 0 },
		box,
		5
	),
	true,
	'a parallel ray beginning inside the other slabs should intersect'
);
assert.equal(
	rayIntersectsAabb(
		{ x: 6, y: 1, z: 1 },
		{ x: 0, y: 1, z: 0 },
		box,
		5
	),
	false,
	'a parallel ray outside one slab should be rejected'
);
assert.equal(
	rayIntersectsAabb(
		{ x: NaN, y: 1, z: 1 },
		fixture.rayDirection,
		box,
		5
	),
	false,
	'non-finite ray input should fail closed'
);

console.log(JSON.stringify({
	ok: true,
	itemCount: allItems.length,
	nearestKind: nearest.item.kind,
	filteredKind: filtered.item.kind,
	invalidKindRejected: fixture.invalid.kind
}, null, 2));
