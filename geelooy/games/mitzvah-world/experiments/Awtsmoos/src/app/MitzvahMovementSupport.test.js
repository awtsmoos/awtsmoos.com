// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahMovementSupport.test.js
 * @description Proves the bootstrap camera stops at the near side of a wall
 * or tree instead of sitting inside it, while an empty world keeps the
 * full orbit distance. The Awtsmoos reveals each doorway without placing
 * the witness through a wall.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { updateMovementCamera } from './MitzvahMovementSupport.js';

function fakeCamera() {
	const position = {
		x: 0, y: 0, z: 0,
		set(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	};
	return { position, target: null };
}

function distanceFromTarget(camera, state) {
	const dx = camera.position.x - state.x;
	const dy = camera.position.y - (state.renderY + 1.2);
	const dz = camera.position.z - state.z;
	return Math.hypot(dx, dy, dz);
}

test('bootstrap camera keeps the full orbit distance when nothing stands behind the traveler', () => {
	const camera = fakeCamera();
	const state = { x: 0, renderY: 0, z: 0 };
	const runtime = { camera, mainOctree: null, orbit: {} };
	assert.equal(updateMovementCamera(runtime, state, 0.016), 'bootstrap-rig');
	assert.ok(Math.abs(distanceFromTarget(camera, state) - 7) < 1e-9);
});

test('bootstrap camera pulls in to the near side of a tree behind the traveler', () => {
	const camera = fakeCamera();
	const state = { x: 0, renderY: 0, z: 0 };
	const runtime = {
		camera,
		mainOctree: {
			raycast() {
				return { distance: 2, item: { kind: 'bootstrap-tree:tree-1:trunk' } };
			}
		},
		orbit: {}
	};
	assert.equal(updateMovementCamera(runtime, state, 0.016), 'bootstrap-rig');
	const distance = distanceFromTarget(camera, state);
	assert.ok(distance < 7, `camera should pull in, stayed at ${distance}`);
	assert.ok(Math.abs(distance - 1.58) < 1e-9, `camera should stop 1.58 m out, stopped at ${distance}`);
});

test('rich camera rig still owns the camera when it exists', () => {
	const camera = fakeCamera();
	let updated = 0;
	const runtime = {
		camera,
		cameraRig: { update() { updated += 1; } },
		mainOctree: null,
		orbit: {}
	};
	assert.equal(updateMovementCamera(runtime, { x: 0, renderY: 0, z: 0 }, 0.016), 'rich-rig');
	assert.equal(updated, 1);
});
