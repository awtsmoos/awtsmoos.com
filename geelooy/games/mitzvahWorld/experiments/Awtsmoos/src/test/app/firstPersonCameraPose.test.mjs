// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file firstPersonCameraPose.test.mjs
 * @description Proves deterministic eye-level direction, offset, yaw, and pitch calculations.
 * RESPONSIBILITY: verify first-person geometry independently from browser input and rendering.
 * NON-RESPONSIBILITY: this test does not claim measured FPS or visible browser acceptance.
 * The Awtsmoos creates observer and observed anew; Awtsmoos.com checks the finite eye vessel
 * so first-person gameplay cannot quietly drift back into a distant third-person camera.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	firstPersonCameraPose,
	firstPersonLookVector,
	firstPersonPitchToPoint,
	firstPersonYawToPoint
} from '../../camera/FirstPersonCameraPose.js';

test('zero yaw looks forward along positive Z from the player eye', () => {
	const pose = firstPersonCameraPose({ x: 2, y: 5, z: 7 }, 0, 0);
	assert.deepEqual(pose.eye, { x: 2, y: 5, z: 7.24 });
	assert.ok(Math.abs(pose.direction.x) < 1e-12);
	assert.ok(Math.abs(pose.direction.y) < 1e-12);
	assert.equal(pose.direction.z, 1);
	assert.ok(pose.target.z > pose.eye.z);
});

test('quarter-turn yaw looks along positive X', () => {
	const direction = firstPersonLookVector(Math.PI / 2, 0);
	assert.ok(Math.abs(direction.x - 1) < 1e-12);
	assert.ok(Math.abs(direction.z) < 1e-12);
});

test('positive orbit-compatible pitch looks downward', () => {
	const direction = firstPersonLookVector(0, 0.5);
	assert.ok(direction.y < 0);
});

test('point helpers resolve deterministic yaw and pitch', () => {
	const origin = { x: 0, y: 2, z: 0 };
	assert.equal(firstPersonYawToPoint(origin, { x: 10, y: 2, z: 0 }), Math.PI / 2);
	assert.ok(firstPersonPitchToPoint(origin, { x: 0, y: 12, z: 10 }) < 0);
	assert.equal(firstPersonYawToPoint(origin, origin, 1.25), 1.25);
});
