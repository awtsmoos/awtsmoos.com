// B"H // Boruch Hashem // Blessed is He

/**
 * @file mathFoundationCompatibility.test.mjs
 * @description Characterizes vectors, rays, boxes, and octree insertion semantics.
 * The Awtsmoos gives every finite coordinate its vessel; Awtsmoos.com preserves
 * exact mutation, inclusion, traversal, and boundary behavior through revelation.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import { Aabb } from '../../math/Aabb.js';
import { Ray } from '../../math/Ray.js';
import { Vec3 } from '../../math/Vec3.js';

test('Vec3 preserves mutation, cloning, normalization, and JSON behavior', () => {
	const vector = new Vec3(1, 2, 3);
	assert.equal(vector.add({ x: 1, y: 2, z: 3 }), vector);
	assert.deepEqual(vector.toJSON(), { x: 2, y: 4, z: 6 });
	assert.deepEqual(vector.clone().sub({ x: 1, y: 1, z: 1 }).toJSON(), {
		x: 1,
		y: 3,
		z: 5
	});
	assert.deepEqual(new Vec3(3, 0, 4).normalize().toJSON(), {
		x: 0.6000000000000001,
		y: 0,
		z: 0.8
	});
	assert.deepEqual(new Vec3().normalize().toJSON(), { x: 0, y: 0, z: 0 });
	assert.deepEqual(Vec3.from({ x: 5 }).toJSON(), { x: 5, y: 0, z: 0 });
});

test('Ray clones and normalizes input while preserving distance evaluation', () => {
	const origin = { x: 1, y: 2, z: 3 };
	const direction = { x: 0, y: 0, z: 2 };
	const ray = new Ray(origin, direction);
	origin.x = 99;
	direction.z = 99;
	assert.deepEqual(ray.origin.toJSON(), { x: 1, y: 2, z: 3 });
	assert.deepEqual(ray.direction.toJSON(), { x: 0, y: 0, z: 1 });
	assert.deepEqual(ray.at(4).toJSON(), { x: 1, y: 2, z: 7 });
});

test('Aabb preserves inclusive contact, containment, expansion, and cloning', () => {
	const box = Aabb.centerSize({ x: 0, y: 0, z: 0 }, { x: 4, y: 6, z: 8 });
	assert.deepEqual(box.toJSON(), {
		min: { x: -2, y: -3, z: -4 },
		max: { x: 2, y: 3, z: 4 }
	});
	assert.equal(box.intersects(new Aabb({ x: 2, y: 3, z: 4 }, { x: 5, y: 6, z: 7 })), true);
	assert.equal(box.intersects(new Aabb({ x: 2.01, y: 0, z: 0 }, { x: 5, y: 1, z: 1 })), false);
	assert.equal(box.containsAabb(new Aabb({ x: -2, y: -3, z: -4 }, { x: 0, y: 0, z: 0 })), true);
	assert.deepEqual(box.expanded(1).toJSON(), {
		min: { x: -3, y: -4, z: -5 },
		max: { x: 3, y: 4, z: 5 }
	});
	assert.notEqual(box.clone(), box);
	assert.deepEqual(box.center().toJSON(), { x: 0, y: 0, z: 0 });
});

test('octree rejects outside items and preserves parent-spanning insertion', () => {
	const bounds = new Aabb({ x: 0, y: 0, z: 0 }, { x: 8, y: 8, z: 8 });
	const octree = new AwtsmoosOctree(bounds, 0, 2);
	const inside = Array.from({ length: 10 }, (_, index) => ({
		id: `inside-${index}`,
		aabb: new Aabb({ x: 1, y: 1, z: 1 }, { x: 1.1, y: 1.1, z: 1.1 })
	}));
	for (const item of inside) {
		assert.equal(octree.insert(item), true);
	}
	const childItem = {
		id: 'child',
		aabb: new Aabb({ x: 6, y: 6, z: 6 }, { x: 6.1, y: 6.1, z: 6.1 })
	};
	const spanning = {
		id: 'spanning',
		aabb: new Aabb({ x: 3, y: 3, z: 3 }, { x: 5, y: 5, z: 5 })
	};
	const outside = {
		id: 'outside',
		aabb: new Aabb({ x: 9, y: 9, z: 9 }, { x: 10, y: 10, z: 10 })
	};
	assert.equal(octree.insert(childItem), true);
	assert.equal(octree.insert(spanning), true);
	assert.equal(octree.insert(outside), false);
	assert.equal(octree.items.includes(spanning), true);
	assert.equal(octree.all([]).length, 12);
	assert.deepEqual(octree.query(childItem.aabb, []).map((item) => item.id), ['child']);
});
