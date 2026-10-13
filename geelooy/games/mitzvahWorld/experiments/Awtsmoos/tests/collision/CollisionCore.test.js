//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CollisionCore.test.js
 * @description Proves collision queries return exact answers on known geometry.
 * The Awtsmoos renews traveler and wall without confusion; these tests witness
 * octree partition, ray traversal, capsule contact, movement resolution, and
 * step climbing against measured floors, walls, and ceilings.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Aabb } from '../../src/math/Aabb.js';
import { Ray } from '../../src/math/Ray.js';
import { v } from '../../src/math/Geometry3D.js';
import { AwtsmoosOctree } from '../../src/collision/AwtsmoosOctree.js';
import { TriangleCollider, trianglesFromIndexed } from '../../src/collision/TriangleCollider.js';
import { capsuleTriangleContact } from '../../src/collision/CapsuleTriangle.js';
import { capsuleFor, deepestContact } from '../../src/collision/CapsuleCollisionQuery.js';
import { createCollisionMovePlan, collisionMoveReceipt } from '../../src/collision/CollisionMovePlan.js';
import { AwtsmoosCollisionMover } from '../../src/collision/AwtsmoosCollisionMover.js';
import { findWalkableStep, applyWalkableStep } from '../../src/collision/StepUpResolver.js';

const ROOT_BOUNDS = new Aabb({ x: -50, y: -50, z: -50 }, { x: 50, y: 50, z: 50 });

/** Builds a 20x20 floor triangle pair at y=0 and a 20-high wall at x=10. */
function worldOctree() {
	const octree = new AwtsmoosOctree(ROOT_BOUNDS, 0, 5, 10);
	const floor = trianglesFromIndexed(
		[v(-10, 0, -10), v(10, 0, -10), v(-10, 0, 10), v(10, 0, 10)],
		[0, 2, 1, 1, 2, 3],
		{ floor: true, kind: 'floor', solid: true }
	);
	// Wall facing -x at x=10 (normal toward the player at x<10).
	const wall = trianglesFromIndexed(
		[v(10, 0, -10), v(10, 0, 10), v(10, 6, -10), v(10, 6, 10)],
		[0, 1, 2, 1, 3, 2],
		{ floor: false, kind: 'wall', solid: true, normal: v(-1, 0, 0) }
	);
	const ceiling = trianglesFromIndexed(
		[v(-2, 4, -2), v(-2, 4, 2), v(2, 4, 2), v(2, 4, -2)],
		[0, 2, 1, 0, 3, 2],
		{ floor: false, kind: 'ceiling', solid: true, normal: v(0, -1, 0) }
	);
	for (const tri of [...floor, ...wall, ...ceiling]) octree.insert(tri);
	return { octree, floor, wall, ceiling };
}

test('TriangleCollider computes upward normals, floor semantics, and bounds', () => {
	const tri = new TriangleCollider(v(0, 0, 0), v(0, 0, 2), v(2, 0, 0), { kind: 'ground' });
	assert.ok(tri.normal.y > 0.99, 'terrain winding faces up');
	assert.equal(tri.floor, true);
	assert.equal(tri.kind, 'ground');
	assert.ok(tri.aabb.min.x <= 0 && tri.aabb.max.x >= 2);
	assert.ok(tri.aabb.min.z <= 0 && tri.aabb.max.z >= 2);
	const steep = new TriangleCollider(v(0, 0, 0), v(0, 2, 0), v(0, 0, 2), { kind: 'wall' });
	assert.equal(steep.floor, false, 'vertical faces are not floors');
});

test('trianglesFromIndexed converts indexed vertices in source order', () => {
	const tris = trianglesFromIndexed([v(0, 0, 0), v(1, 0, 0), v(0, 0, 1), v(9, 9, 9)], [0, 1, 2], { kind: 't' });
	assert.equal(tris.length, 1);
	assert.deepEqual([tris[0].a.x, tris[0].b.x, tris[0].c.x], [0, 1, 0]);
});

test('octree query returns only spatially intersecting items', () => {
	const { octree } = worldOctree();
	const near = octree.query(new Aabb({ x: 9, y: -1, z: -1 }, { x: 11, y: 7, z: 1 }));
	const kinds = new Set(near.map(item => item.kind));
	assert.ok(kinds.has('wall'), 'wall region returns the wall');
	assert.ok(!kinds.has('ceiling'), 'wall region excludes the ceiling');
	const all = octree.query(ROOT_BOUNDS);
	assert.equal(all.length, 6, 'every triangle is retrievable');
});

test('octree raycast finds the nearest hit and honors predicates', () => {
	const { octree } = worldOctree();
	const down = new Ray({ x: 5, y: 5, z: 0 }, { x: 0, y: -1, z: 0 });
	const hit = octree.raycast(down, 50);
	assert.ok(hit, 'expected a floor hit');
	assert.ok(Math.abs(hit.distance - 5) < 1e-6, `floor at distance 5, got ${hit.distance}`);
	assert.equal(hit.item.kind, 'floor');
	const side = new Ray({ x: 0, y: 2, z: 0 }, { x: 1, y: 0, z: 0 });
	const wallHit = octree.raycast(side, 50);
	assert.ok(wallHit, 'expected a wall hit');
	assert.ok(Math.abs(wallHit.distance - 10) < 1e-6);
	const ceilingRay = new Ray({ x: 0, y: 5, z: 0 }, { x: 0, y: -1, z: 0 });
	const ceilingHit = octree.raycast(ceilingRay, 50);
	assert.ok(ceilingHit, 'ray through the slab strikes the ceiling first');
	assert.equal(ceilingHit.item.kind, 'ceiling');
	assert.ok(Math.abs(ceilingHit.distance - 1) < 1e-6);
	const filtered = octree.raycast(down, 50, item => item.kind === 'wall');
	assert.ok(!filtered, 'predicate excludes the floor');
	const short = octree.raycast(down, 4);
	assert.ok(!short, 'maximumDistance truncates before the floor');
	const sky = octree.raycast(new Ray({ x: 0, y: 5, z: 0 }, { x: 0, y: 1, z: 0 }), 50);
	assert.ok(!sky, 'upward ray misses');
});

test('capsuleTriangleContact reports exact depth and normal on a floor', () => {
	const tri = new TriangleCollider(v(-5, 0, -5), v(-5, 0, 5), v(5, 0, -5), { floor: true, kind: 'floor', solid: true });
	// Bottom sphere center 0.3 above the floor with radius 0.4: 0.1 of penetration.
	const capsule = { radius: 0.4, start: { x: 0, y: 0.3, z: 0 }, end: { x: 0, y: 2.0, z: 0 } };
	const hit = capsuleTriangleContact(capsule, tri);
	assert.ok(hit, 'bottom sphere overlaps the floor');
	assert.ok(Math.abs(hit.depth - 0.102) < 1e-9, `depth should be radius - distance + slop, got ${hit.depth}`);
	assert.ok(hit.normal.y > 0.99, 'contact normal faces up');
	assert.equal(hit.kind, 'floor');
	const distant = capsuleTriangleContact(
		{ radius: 0.4, start: { x: 0, y: 5, z: 0 }, end: { x: 0, y: 6.7, z: 0 } },
		tri
	);
	assert.equal(distant, null, 'far capsule reports no contact');
});

test('capsuleTriangleContact rejects the far side via facing normal', () => {
	// Triangle normal forced downward (a ceiling); capsule below it.
	const tri = new TriangleCollider(v(-5, 4, -5), v(-5, 4, 5), v(5, 4, -5), { floor: false, kind: 'ceiling', solid: true, normal: v(0, -1, 0) });
	const capsule = { radius: 0.4, start: { x: 0, y: 3.7, z: 0 }, end: { x: 0, y: 2, z: 0 } };
	const hit = capsuleTriangleContact(capsule, tri);
	assert.ok(hit, 'capsule touches ceiling from below');
	assert.ok(hit.normal.y < -0.99, 'normal faces down toward the capsule');
});

test('deepestContact scans octree candidates through a capsule query', () => {
	const { octree } = worldOctree();
	const capsule = capsuleFor({ x: 0, y: 0, z: 0 }, 0.4, 1.72, 0);
	const hit = deepestContact({
		octree,
		capsule,
		radius: 0.4,
		options: {},
		accept: () => true
	});
	assert.ok(hit, 'capsule resting on the floor plane contacts');
});

test('createCollisionMovePlan bounds substeps and rejects invalid input', () => {
	const plan = createCollisionMovePlan({ x: 1, z: 0 }, 0.055);
	assert.ok(plan.substeps >= 18, `1m stride needs many substeps, got ${plan.substeps}`);
	assert.ok(Math.hypot(plan.step.x, plan.step.z) <= 0.055 + 1e-9);
	const invalid = createCollisionMovePlan({ x: NaN, z: Infinity });
	assert.equal(invalid.invalidInput, true);
	assert.deepEqual(invalid.requested, { x: 0, z: 0 });
	const tiny = createCollisionMovePlan({ x: 0.01, z: 0 });
	assert.equal(tiny.substeps, 1);
});

test('collisionMoveReceipt records applied motion immutably', () => {
	const plan = createCollisionMovePlan({ x: 0.1, z: 0.2 });
	const receipt = collisionMoveReceipt(plan, { x: 1, z: 2 }, { x: 1.05, z: 2.1 });
	assert.ok(Math.abs(receipt.applied.x - 0.05) < 1e-9);
	assert.ok(Object.isFrozen(receipt));
});

test('AwtsmoosCollisionMover stops at a real wall without penetration', () => {
	const { octree } = worldOctree();
	const mover = new AwtsmoosCollisionMover({ octree, radius: 0.38, height: 1.72, footOffset: 0 });
	const position = { x: 5, y: 0, z: 0 };
	mover.move(position, { x: 8, z: 0 }, { maximumSubstep: 0.055 });
	assert.ok(position.x <= 10 - 0.38 + 0.01, `player must stop before the wall, stopped at x=${position.x}`);
	assert.ok(position.x > 9, `player should travel close to the wall, reached x=${position.x}`);
});

test('AwtsmoosCollisionMover pushes the capsule out of a ceiling', () => {
	const { octree } = worldOctree();
	const mover = new AwtsmoosCollisionMover({ octree, radius: 0.38, height: 1.72, footOffset: 0 });
	// Head inside the ceiling slab at y=4: capsule end at 1.72+0.25... place feet so head overlaps.
	const position = { x: 0, y: 2.6, z: 0 };
	const before = position.y;
	mover.resolveCeiling(position);
	assert.ok(position.y <= before, 'ceiling resolution pushes the player down, never up');
});

test('findWalkableStep climbs a low tread and rejects a tall riser', () => {
	const ground = {
		sample(x, z, options) {
			const height = x > 1 ? 0.3 : 0;
			return { height, normal: { x: 0, y: 1, z: 0 }, kind: 'floor' };
		}
	};
	const base = { position: { x: 0, y: 0, z: 0 }, delta: { x: 2, z: 0 }, footOffset: 0, radius: 0.38, maxStep: 0.35, maxSlopeNormal: 0.72 };
	const step = findWalkableStep({ ...base, ground });
	assert.ok(step, 'low tread is walkable');
	assert.ok(Math.abs(step.height - 0.3) < 1e-9);
	const position = { x: 0, y: 0, z: 0 };
	assert.ok(applyWalkableStep(position, step, 0));
	assert.ok(Math.abs(position.y - 0.3) < 1e-9);
	const tall = findWalkableStep({ ...base, ground: { sample: () => ({ height: 2, normal: { x: 0, y: 1, z: 0 }, kind: 'floor' }) } });
	assert.equal(tall, null, '2m riser is not a step');
	const idle = findWalkableStep({ ...base, delta: { x: 0, z: 0 }, ground });
	assert.equal(idle, null, 'no movement means no step');
	assert.equal(applyWalkableStep({ x: 0 }, null, 0), false);
});

test('capsuleFor builds a foot-anchored capsule from player state', () => {
	const capsule = capsuleFor({ x: 3, y: 1.7, z: -2 }, 0.38, 1.72, 0);
	assert.deepEqual(capsule.start, { x: 3, y: 1.95, z: -2 });
	assert.deepEqual(capsule.end, { x: 3, y: 3.42, z: -2 });
	assert.equal(capsule.radius, 0.38);
	const raised = capsuleFor({ x: 0, y: 1.7, z: 0 }, 0.38, 1.72, 0.5);
	assert.deepEqual(raised.start, { x: 0, y: 1.45, z: 0 }, 'footOffset lowers the capsule base');
});
