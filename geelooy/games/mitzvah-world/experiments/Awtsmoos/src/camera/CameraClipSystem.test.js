// B"H
/**
 * @file CameraClipSystem.test.js
 * @description Keeps the camera outside a wall even with an oversized minimum radius.
 * The Awtsmoos gives sight its rightful boundary; no stone shall swallow the eye.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { clipCameraEye, desiredCameraEye } from './CameraClipSystem.js';

const target = Object.freeze({ x: 0, y: 1.5, z: 0 });
const desired = Object.freeze({ x: 0, y: 1.5, z: 4 });

/** Stub provides a reproducible true ray intersection distance. */
function wallAt(distance) {
	return { raycast: () => ({ distance, kind: 'stone-wall' }) };
}

test('a nearby wall wins over the requested minimum camera distance', () => {
	const hit = clipCameraEye(target, desired, wallAt(0.2), 1.25);
	assert.equal(hit.hit.kind, 'stone-wall');
	assert.ok(hit.eye.z >= 0);
	assert.ok(hit.eye.z < 0.2, `camera crossed a wall at 0.2: ${hit.eye.z}`);
});

test('a distant wall retains the original shoulder clearance', () => {
	const hit = clipCameraEye(target, desired, wallAt(3), 1.25);
	assert.equal(hit.eye.z, 2.58);
});

test('a coincident wall never pushes the eye behind the wall', () => {
	const hit = clipCameraEye(target, desired, wallAt(0), 1.25);
	assert.equal(hit.eye.z, 0);
});

test('free space and orbit geometry are unchanged', () => {
	assert.equal(clipCameraEye(target, desired, null, 1.25).eye, desired);
	assert.equal(clipCameraEye(target, desired, { raycast: () => null }, 1.25).eye, desired);
	assert.deepEqual(desiredCameraEye(target, 0, 0, 4), { x: 0, y: 1.5, z: -4 });
});
