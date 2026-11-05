// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SunShadowMeshes.test.js
 * @description Proves the projected-shadow presentation builds its three shadow
 * vessels, attaches them to the scene, and places shadows with a yaw-derived
 * quaternion while sealing the base transform.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSunShadowMeshes, placeSunShadow } from './SunShadowMeshes.js';

function fakeMesh() {
	return {
		setCalls: [],
		position: { set: (x, y, z) => fakeMesh.lastPosition = [x, y, z] },
		quaternion: { set: (x, y, z, w) => fakeMesh.lastQuaternion = [x, y, z, w] },
		setBaseTransform: () => fakeMesh.sealed.push(true)
	};
}
fakeMesh.lastPosition = null;
fakeMesh.lastQuaternion = null;
fakeMesh.sealed = [];

test('placeSunShadow positions, yaws, and seals the base transform', () => {
	const mesh = fakeMesh();
	placeSunShadow(mesh, 3, 0.5, -2, Math.PI / 2);
	assert.deepEqual(fakeMesh.lastPosition, [3, 0.5, -2]);
	// yaw = π/2 → quaternion (0, sin(π/4), 0, cos(π/4)).
	const expected = [0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4)];
	for (let i = 0; i < 4; i++) {
		assert.ok(Math.abs(fakeMesh.lastQuaternion[i] - expected[i]) < 1e-12, `quat[${i}]`);
	}
	assert.equal(fakeMesh.sealed.length, 1);
});

test('createSunShadowMeshes builds three vessels and attaches the group', () => {
	const added = [];
	const scene = { add: node => added.push(node) };
	const meshes = createSunShadowMeshes(scene);
	assert.ok(meshes.group && meshes.player && meshes.npc && meshes.house);
	assert.equal(added.length, 1);
	assert.equal(added[0], meshes.group);
	// The group exposes the soft-disc ring helpers; every vessel is sealed-ready.
	for (const vessel of [meshes.player, meshes.npc, meshes.house]) {
		assert.equal(typeof vessel.setBaseTransform, 'function');
	}
});
