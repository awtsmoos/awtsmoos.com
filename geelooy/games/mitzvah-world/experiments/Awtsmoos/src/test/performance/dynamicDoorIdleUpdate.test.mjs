// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file dynamicDoorIdleUpdate.test.mjs
 * @description Proves resting doors preserve their complete pose and collider witnesses.
 * A closed or open door has no new motion to express, so its frame update must not rebuild
 * matrices or collision triangles until its progress actually changes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { DynamicDoor3D } from '../../world/DynamicDoor3D.js';

test('resting closed and open doors preserve pose, matrix, and collider identities', () => {
	const door = new DynamicDoor3D();
	assertStableUpdate(door);

	door.toggle();
	door.update(1);
	assert.equal(door.state, 'open');
	assert.equal(door.t, 1);
	assert.equal(door.pose.progress, 1);
	assertStableUpdate(door);
});

test('a door rebuilds colliders only when its animated progress changes', () => {
	const door = new DynamicDoor3D();
	const closedColliders = door.activeColliders();
	const closedPose = door.pose;

	door.toggle();
	door.update(0.1);
	assert.equal(door.state, 'opening');
	assert.ok(door.t > 0 && door.t < 1);
	assert.notStrictEqual(door.pose, closedPose);
	assert.notStrictEqual(door.activeColliders(), closedColliders);

	const movingPose = door.pose;
	const movingMatrix = door.mesh.matrix;
	const movingColliders = door.activeColliders();
	door.update(0);
	assert.strictEqual(door.pose, movingPose);
	assert.strictEqual(door.mesh.matrix, movingMatrix);
	assert.strictEqual(door.activeColliders(), movingColliders);

	door.update(1);
	assert.equal(door.state, 'open');
	assert.equal(door.t, 1);
	assert.equal(door.pose.progress, 1);
	assert.notStrictEqual(door.activeColliders(), movingColliders);
});

function assertStableUpdate(door) {
	const pose = door.pose;
	const matrix = door.mesh.matrix;
	const matrixWorld = door.mesh.matrixWorld;
	const colliders = door.activeColliders();
	const firstCollider = colliders[0];

	door.update(1 / 60);

	assert.strictEqual(door.pose, pose);
	assert.strictEqual(door.mesh.matrix, matrix);
	assert.strictEqual(door.mesh.matrixWorld, matrixWorld);
	assert.strictEqual(door.activeColliders(), colliders);
	assert.strictEqual(door.activeColliders()[0], firstCollider);
}
