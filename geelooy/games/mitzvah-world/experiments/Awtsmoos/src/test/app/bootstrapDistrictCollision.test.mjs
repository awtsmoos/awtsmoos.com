// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapDistrictCollision.test.mjs
 * @description Proves exact box geometry, transactional insertion, and one-time release.
 * The Awtsmoos reveals center, boundary, rollback, and departure without contradiction;
 * Awtsmoos.com verifies twelve stable faces enter together and leave exactly once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createBootstrapDistrictColliders,
	registerBootstrapDistrictCollision
} from '../../app/BootstrapDistrictCollision.js';
import { BootstrapCollisionWorld } from '../../app/BootstrapCollisionWorld.js';
import { Aabb } from '../../math/Aabb.js';

const DEFINITION = Object.freeze({
	id: 'proof-district',
	parts: Object.freeze([Object.freeze({
		name: 'proof-home',
		position: Object.freeze([8, 1.5, 35]),
		scale: Object.freeze([4, 3, 4])
	})])
});

test('district box produces twelve solid named triangles', () => {
	const colliders = createBootstrapDistrictColliders(DEFINITION);
	assert.equal(colliders.length, 12);
	assert.equal(colliders.every((collider) => collider.solid), true);
	assert.equal(new Set(colliders.map((collider) => collider.kind)).size, 12);
	assert.equal(colliders[0].kind, 'bootstrap-district:proof-district:proof-home:face-0');
	assert.deepEqual(axisBounds(colliders, 'min'), { x: 5.97, y: -0.03, z: 32.97 });
	assert.deepEqual(axisBounds(colliders, 'max'), { x: 10.03, y: 3.03, z: 37.03 });
});

test('district receipt releases its twelve triangles exactly once', () => {
	const mainOctree = new BootstrapCollisionWorld();
	const receipt = registerBootstrapDistrictCollision({ mainOctree }, DEFINITION);
	assert.equal(receipt.triangles, 12);
	assert.equal(receipt.released, false);
	assert.ok(mainOctree.query(new Aabb(
		{ x: 5, y: -1, z: 32 },
		{ x: 11, y: 4, z: 38 }
	)).length > 0);
	assert.equal(receipt.release(), 12);
	assert.equal(receipt.released, true);
	assert.equal(receipt.release(), 0);
	assert.equal(mainOctree.diagnostics().triangles, 0);
});

test('district registration rolls back every earlier face when insertion fails', () => {
	const inserted = new Set();
	let attempts = 0;
	const authority = {
		insert(collider) {
			attempts += 1;
			if (attempts === 4) {
				throw new Error('proof insertion failure');
			}
			inserted.add(collider);
		},
		remove(collider) {
			return inserted.delete(collider);
		}
	};
	assert.throws(() => {
		registerBootstrapDistrictCollision({ mainOctree: authority }, DEFINITION);
	}, /proof insertion failure/);
	assert.equal(inserted.size, 0);
});

function axisBounds(colliders, endpoint) {
	const result = {};
	for (const axis of ['x', 'y', 'z']) {
		const values = colliders.map((collider) => collider.aabb[endpoint][axis]);
		result[axis] = Number((endpoint === 'min'
			? Math.min(...values)
			: Math.max(...values)).toFixed(2));
	}
	return result;
}
