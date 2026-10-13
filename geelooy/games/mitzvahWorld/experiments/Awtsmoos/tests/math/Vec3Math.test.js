//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Vec3Math.test.js
 * @description Proves the math vessels (Vec3, Aabb, Ray, RayAabb, Geometry3D) are exact and NaN-free.
 * The Awtsmoos measures every finite direction without concealment; these tests
 * witness vectors, boxes, rays, and triangle math against known geometry.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Vec3 } from '../../src/math/Vec3.js';
import { Aabb } from '../../src/math/Aabb.js';
import { Ray } from '../../src/math/Ray.js';
import { rayIntersectsAabb } from '../../src/math/RayAabb.js';
import {
	add,
	closestPointOnSegment,
	closestPointsSegmentSegment,
	cross,
	dot,
	length,
	minMax,
	normalize,
	rayTriangle,
	rotateY,
	scale,
	sub,
	triangleContainsPoint,
	triangleNormal,
	transformPoint,
	v
} from '../../src/math/Geometry3D.js';

test('Vec3 arithmetic is exact and chainable', () => {
	const a = new Vec3(1, 2, 3);
	const b = new Vec3(4, -1, 0.5);
	a.add(b);
	assert.deepEqual([a.x, a.y, a.z], [5, 1, 3.5]);
	a.sub(b).scale(2);
	assert.deepEqual([a.x, a.y, a.z], [2, 4, 6]);
	assert.equal(new Vec3(3, 4, 0).length(), 5);
	const unit = new Vec3(3, 4, 0).normalize();
	assert.ok(Math.abs(unit.length() - 1) < 1e-12);
});

test('Vec3 normalize leaves the zero vector unchanged without NaN', () => {
	const zero = new Vec3(0, 0, 0).normalize();
	assert.deepEqual([zero.x, zero.y, zero.z], [0, 0, 0]);
	assert.ok(Number.isFinite(zero.x + zero.y + zero.z));
});

test('Vec3 clone is independent and from/toJSON round-trip', () => {
	const original = new Vec3(1, 2, 3);
	const copy = original.clone();
	copy.x = 9;
	assert.equal(original.x, 1);
	assert.deepEqual(Vec3.from({ x: 1 }).toJSON(), { x: 1, y: 0, z: 0 });
});

test('Aabb intersects touching boxes and rejects separated ones', () => {
	const box = Aabb.centerSize({ x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 2 });
	assert.ok(box.intersects(Aabb.centerSize({ x: 2, y: 0, z: 0 }, { x: 2, y: 2, z: 2 })), 'edge contact counts');
	assert.ok(!box.intersects(Aabb.centerSize({ x: 2.001, y: 0, z: 0 }, { x: 2, y: 2, z: 2 })), 'gap rejects');
	assert.deepEqual(box.center(), new Vec3(0, 0, 0));
	assert.ok(box.containsAabb(Aabb.centerSize({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 })));
	assert.ok(!box.containsAabb(Aabb.centerSize({ x: 1.5, y: 0, z: 0 }, { x: 2, y: 2, z: 2 })));
	const grown = box.expanded(1);
	assert.deepEqual([grown.min.x, grown.max.x], [-2, 2]);
});

test('Ray.at travels along a normalized direction', () => {
	const ray = new Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
	assert.deepEqual([ray.direction.x, ray.direction.y, ray.direction.z], [0, 0, 1]);
	assert.deepEqual(ray.at(3).toJSON(), { x: 0, y: 0, z: 3 });
	const degenerate = new Ray({ x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 0 });
	assert.ok(Number.isFinite(degenerate.direction.x + degenerate.direction.y + degenerate.direction.z), 'no NaN on zero direction');
});

test('rayIntersectsAabb answers known hit/miss/parallax cases', () => {
	const bounds = { min: { x: -1, y: -1, z: 4 }, max: { x: 1, y: 1, z: 6 } };
	assert.ok(rayIntersectsAabb({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, bounds), 'straight hit');
	assert.ok(!rayIntersectsAabb({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, bounds), 'perpendicular miss');
	assert.ok(rayIntersectsAabb({ x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: 1 }, bounds), 'origin inside');
	assert.ok(!rayIntersectsAabb({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, bounds, 3), 'horizon honored');
	assert.ok(!rayIntersectsAabb({ x: 5, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, bounds), 'parallel outside slab');
	assert.ok(!rayIntersectsAabb({ x: NaN, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, bounds), 'NaN origin rejected');
	assert.ok(!rayIntersectsAabb({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { min: { x: 1 }, max: {} }), 'malformed bounds rejected');
});

test('Geometry3D dot/cross/length/normalize obey the right-hand rule', () => {
	assert.equal(dot(v(1, 0, 0), v(0, 1, 0)), 0);
	assert.deepEqual(cross(v(1, 0, 0), v(0, 1, 0)), v(0, 0, 1));
	assert.equal(length(v(3, 4, 0)), 5);
	const unit = normalize(v(0, 0, 9));
	assert.deepEqual(unit, v(0, 0, 1));
	assert.deepEqual(add(v(1, 1, 1), v(2, 2, 2)), v(3, 3, 3));
});

test('triangleNormal points up for terrain winding order', () => {
	// Same (first, third, second) winding the terrain index builder emits.
	const a = v(0, 0, 0), b = v(0, 0, 2), c = v(2, 0, 0);
	const normal = triangleNormal(a, b, c);
	assert.ok(normal.y > 0.99, `expected up-facing, got ${JSON.stringify(normal)}`);
});

test('triangleContainsPoint accepts interior, edge, rejects exterior', () => {
	const tri = { a: v(0, 0, 0), b: v(4, 0, 0), c: v(0, 0, 4) };
	assert.ok(triangleContainsPoint(v(1, 0, 1), tri));
	assert.ok(triangleContainsPoint(v(2, 0, 0), tri), 'edge counts as inside');
	assert.ok(!triangleContainsPoint(v(4, 0, 4), tri));
});

test('rayTriangle (Moller-Trumbore) hits the known floor and misses away', () => {
	const tri = { a: v(-1, 0, -1), b: v(-1, 0, 1), c: v(1, 0, -1), normal: v(0, 1, 0), kind: 'floor' };
	const hit = rayTriangle(v(0, 5, 0), v(0, -1, 0), tri);
	assert.ok(hit, 'expected hit');
	assert.ok(Math.abs(hit.distance - 5) < 1e-9);
	assert.deepEqual(hit.normal, v(0, 1, 0));
	assert.ok(!rayTriangle(v(0, 5, 0), v(0, 1, 0), tri), 'upward miss');
	assert.ok(!rayTriangle(v(0, 5, 0), v(1, 0, 0), tri), 'parallel miss');
	assert.ok(!rayTriangle(v(10, 5, 0), v(0, -1, 0), tri), 'offset miss');
	assert.ok(!rayTriangle(v(0, 5, 0), v(0, -1, 0), tri, 4), 'maxDistance honored');
});

test('closestPointOnSegment and segment-segment return the true minima', () => {
	const p = closestPointOnSegment(v(1, 2, 0), v(0, 0, 0), v(4, 0, 0));
	assert.deepEqual(p, v(1, 0, 0));
	const [s1, s2] = closestPointsSegmentSegment(v(0, 0, 0), v(2, 0, 0), v(1, 1, 0), v(1, -1, 0));
	assert.ok(Math.abs(s1.x - 1) < 1e-9 && Math.abs(s2.x - 1) < 1e-9);
	assert.ok(Math.abs(s1.y) < 1e-9 && Math.abs(s2.y) < 1e-9);
});

test('rotateY/transformPoint place a point through one yaw', () => {
	const rotated = rotateY(v(1, 0, 0), Math.PI / 2);
	assert.ok(Math.abs(rotated.x) < 1e-12 && Math.abs(rotated.z - 1) < 1e-12);
	const moved = transformPoint(v(1, 0, 0), v(10, 0, 5), Math.PI);
	assert.ok(Math.abs(moved.x - 9) < 1e-12 && Math.abs(moved.z - 5) < 1e-12);
});

test('minMax bounds a point cloud exactly', () => {
	const { min, max } = minMax([v(1, 5, -2), v(-3, 0, 7)]);
	assert.deepEqual(min, v(-3, 0, -2));
	assert.deepEqual(max, v(1, 5, 7));
});

test('scale preserves the plain-vector contract', () => {
	assert.deepEqual(scale(v(1, -2, 3), 2), v(2, -4, 6));
	assert.deepEqual(sub(v(5, 5, 5), v(1, 2, 3)), v(4, 3, 2));
});
