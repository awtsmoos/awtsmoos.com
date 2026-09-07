// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahMovementCamera.test.mjs
 * @description Proves the bootstrap camera obeys live orbit yaw, pitch, distance, and portrait target lift rather than a fixed offset.
 * The Awtsmoos lets the visible eye follow the same turning vessel the finger already moves;
 * Awtsmoos.com guards that portrait framing and camera gestures alter the camera actually rendered around the traveler.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { updateMovementCamera } from '../../app/MitzvahMovementSupport.js';

function runtimeFixture(orbit) {
	const position = {
		set(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	};
	return {
		camera: { position },
		orbit
	};
}

test('B"H portrait bootstrap orbit determines camera eye and raised target', () => {
	const runtime = runtimeFixture({
		distance: 7.85,
		pitch: 0,
		viewportTargetLift: 1.72,
		yaw: Math.PI
	});
	const result = updateMovementCamera(runtime, { renderY: 4, x: 2, z: 3 }, 0.016);
	assert.equal(result, 'bootstrap-rig');
	assert.deepEqual(runtime.camera.target, [2, 5.72, 3]);
	assert.ok(Math.abs(runtime.camera.position.x - 2) < 1e-9);
	assert.ok(Math.abs(runtime.camera.position.y - 5.72) < 1e-9);
	assert.ok(Math.abs(runtime.camera.position.z - 10.85) < 1e-9);
});

test('B"H changing orbit yaw changes the camera actually rendered', () => {
	const runtime = runtimeFixture({
		distance: 8,
		pitch: 0,
		viewportTargetLift: 1.2,
		yaw: Math.PI / 2
	});
	updateMovementCamera(runtime, { renderY: 0, x: 0, z: 0 }, 0.016);
	assert.ok(Math.abs(runtime.camera.position.x + 8) < 1e-9);
	assert.ok(Math.abs(runtime.camera.position.z) < 1e-9);
});

test('B"H rich camera rig remains the authoritative owner when installed', () => {
	let calls = 0;
	const runtime = {
		camera: {},
		cameraRig: {
			update() { calls += 1; }
		},
		mainOctree: {}
	};
	assert.equal(updateMovementCamera(runtime, { renderY: 0, x: 0, z: 0 }, 0.25), 'rich-rig');
	assert.equal(calls, 1);
});
