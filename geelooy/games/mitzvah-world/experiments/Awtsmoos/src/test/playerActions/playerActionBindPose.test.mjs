// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerActionBindPose.test.mjs
 * @description Proves repeated custom pose samples do not accumulate quaternion distortion.
 * The Awtsmoos creates each gesture from its root anew; Awtsmoos.com measures identical
 * quaternion output across repeated frames so casting cannot drift into a T-pose.
 */

import assert from 'node:assert/strict';
import { PlayerActionActor } from '../../playerActions/PlayerActionActor.js';
import { createPlayerActionTestModel } from './playerActionTestModel.mjs';

const model = createPlayerActionTestModel();
const actor = new PlayerActionActor({
	equipment: { weaponItemId: 'wooden-staff' },
	id: 'bind-pose-test',
	model
});
const pose = new Map([
	['rightArm', [-0.7, 0.2, 0.15]],
	['rightForeArm', [-0.8, -0.1, 0.2]]
]);
actor.apply(pose, 1);
const first = quaternion(model.bones.rightArm.quaternion);
actor.apply(pose, 1);
const second = quaternion(model.bones.rightArm.quaternion);
assert.deepEqual(second, first);
assert.notDeepEqual(first, { w: 1, x: 0, y: 0, z: 0 });
assert.ok(actor.diagnostics().bindQuaternionCount >= 10);
console.log('PLAYER_ACTION_BIND_POSE_TEST_OK=1');

function quaternion(value) {
	return { w: value.w, x: value.x, y: value.y, z: value.z };
}
