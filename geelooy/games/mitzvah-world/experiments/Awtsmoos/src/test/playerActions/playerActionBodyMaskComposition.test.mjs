// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerActionBodyMaskComposition.test.mjs
 * @description Proves upper-body overlays preserve imported lower-body truth without accumulation.
 * The Awtsmoos renews every measured quaternion; Awtsmoos.com lets arms reveal a deed while
 * root, hips, and legs remain the faithful vessels of imported locomotion.
 */

import assert from 'node:assert/strict';
import { PlayerActionBodyMaskRuntime } from '../../playerActions/PlayerActionBodyMaskRuntime.js';
import { PLAYER_ACTION_UPPER_BODY_ROLES } from '../../playerActions/PlayerActionBodyMask.js';

const actor = { bones: createBones() };
const runtime = new PlayerActionBodyMaskRuntime(actor);
const lowerBefore = snapshot(actor, ['root', 'hips', 'leftLeg', 'rightLeg']);
const importedArm = setAxisAngle(actor.bones.rightArm.quaternion, 0, 1, 0, 0.35);
const importedSpine = setAxisAngle(actor.bones.spine.quaternion, 0, 0, 1, -0.2);
runtime.captureImportedPose();
const pose = new Map([
	['root', [1, 0, 0]],
	['hips', [1, 0, 0]],
	['leftLeg', [1, 0, 0]],
	['rightArm', [0.8, -0.4, 0.2]],
	['spine', [0.3, 0.2, 0]],
	['head', [4, 4, 4]]
]);
const first = runtime.apply(pose, 1);
const firstUpper = snapshot(actor, ['rightArm', 'spine', 'head']);
assert.deepEqual(snapshot(actor, Object.keys(lowerBefore)), lowerBefore);
assert.equal(first.applied, 3);
assert.equal(first.filtered, 3);
assert.equal(PLAYER_ACTION_UPPER_BODY_ROLES.includes('hips'), false);
assert.equal(PLAYER_ACTION_UPPER_BODY_ROLES.includes('leftLeg'), false);
assert.ok(rotationAngle(firstUpper.head) <= 0.22);

runtime.apply(pose, 1);
assertQuaternionMapClose(snapshot(actor, ['rightArm', 'spine', 'head']), firstUpper);

const freshArm = setAxisAngle(actor.bones.rightArm.quaternion, 1, 0, 0, -0.45);
const freshSpine = setAxisAngle(actor.bones.spine.quaternion, 0, 1, 0, 0.25);
runtime.apply(pose, 0.5);
runtime.restore();
assertQuaternionClose(actor.bones.rightArm.quaternion, freshArm);
assertQuaternionClose(actor.bones.spine.quaternion, freshSpine);
assert.notDeepEqual(freshArm, importedArm);
assert.notDeepEqual(freshSpine, importedSpine);
console.log('PLAYER_ACTION_BODY_MASK_COMPOSITION_TEST_OK=1');

function createBones() {
	return Object.fromEntries([
		'root', 'hips', 'leftLeg', 'rightLeg', 'spine', 'rightArm', 'head'
	].map(role => [role, { quaternion: quaternion() }]));
}

function quaternion() {
	return { w: 1, x: 0, y: 0, z: 0, set(x, y, z, w) { Object.assign(this, { w, x, y, z }); } };
}

function setAxisAngle(value, x, y, z, angle) {
	const sine = Math.sin(angle / 2);
	value.set(x * sine, y * sine, z * sine, Math.cos(angle / 2));
	return record(value);
}

function snapshot(value, roles) {
	return Object.fromEntries(roles.map(role => [role, record(value.bones[role].quaternion)]));
}

function record(value) {
	return { w: value.w, x: value.x, y: value.y, z: value.z };
}

function assertQuaternionMapClose(actual, expected) {
	for (const role of Object.keys(expected)) assertQuaternionClose(actual[role], expected[role]);
}

function assertQuaternionClose(actual, expected, tolerance = 1e-12) {
	for (const key of ['w', 'x', 'y', 'z']) assert.ok(Math.abs(actual[key] - expected[key]) <= tolerance, key);
}

function rotationAngle(value) {
	return 2 * Math.acos(Math.min(1, Math.abs(value.w)));
}
