// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictCollision.test.js
 * @description Proves one structural district box becomes twelve solid
 * triangles, inserts transactionally, and releases cleanly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createBootstrapDistrictColliders,
	createBoxTriangleColliders,
	registerBootstrapDistrictCollision
} from './BootstrapDistrictCollision.js';

function fakeOctree() {
	return {
		items: [],
		insert(collider) {
			this.items.push(collider);
		},
		remove(collider) {
			const at = this.items.indexOf(collider);
			if (at < 0) return false;
			this.items.splice(at, 1);
			return true;
		}
	};
}

test('one box is twelve solid triangles with the district kind', () => {
	const colliders = createBoxTriangleColliders(
		{ x: 0, y: 1, z: 0 },
		{ x: 1, y: 1, z: 1 },
		'bootstrap-district:gate:wall'
	);
	assert.equal(colliders.length, 12);
	assert.ok(colliders.every(collider => collider.solid === true));
	assert.ok(colliders.every(collider => collider.kind.startsWith('bootstrap-district:gate:wall:face-')));
});

test('district colliders skip decor parts and keep structural ones', () => {
	const colliders = createBootstrapDistrictColliders({
		id: 'gateway-homes',
		parts: [
			{ name: 'wall', position: [0, 1, 0], scale: [2, 2, 2] },
			{ name: 'door', position: [5, 1, 0], scale: [1, 2, 0.2], collides: false }
		]
	});
	assert.equal(colliders.length, 12);
});

test('registration inserts transactionally and releases every triangle', () => {
	const runtime = { mainOctree: fakeOctree() };
	const receipt = registerBootstrapDistrictCollision(runtime, {
		id: 'gateway-homes',
		parts: [{ name: 'wall', position: [0, 1, 0], scale: [2, 2, 2] }]
	});
	assert.equal(receipt.triangles, 12);
	assert.equal(runtime.mainOctree.items.length, 12);
	assert.equal(receipt.release(), 12);
	assert.equal(runtime.mainOctree.items.length, 0);
	assert.equal(receipt.released, true);
});

test('registration without an authority throws instead of half-installing', () => {
	assert.throws(
		() => registerBootstrapDistrictCollision({}, { id: 'x', parts: [] }),
		/bootstrap district collision authority is unavailable/
	);
});
