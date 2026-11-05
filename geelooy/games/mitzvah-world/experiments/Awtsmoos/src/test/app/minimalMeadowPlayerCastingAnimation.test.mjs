// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import {
	minimalMeadowClipForState,
	minimalMeadowClipPolicyEvidence
} from '../../app/MinimalMeadowAnimationClipPolicy.js';
import { MinimalMeadowCombatAnimationController } from '../../app/MinimalMeadowCombatAnimationController.js';
import { MinimalMeadowPlayerBonePose } from '../../app/MinimalMeadowPlayerBonePose.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

const names = ['punch', 'stab', 'neutral_Armature', 'stand_Armature', 'walk_Armature', 'run_Armature'];
const policy = minimalMeadowClipPolicyEvidence(names);
assert.equal(policy.castBase, 'stand_Armature');
assert.equal(policy.castUsesAttack, false);
assert.equal(minimalMeadowClipForState(names, 'melee-impact', { weaponKind: 'sword' }), 'stab');

const bus = new AwtsmoosEventBus();
const runtime = { bus, combat: { cast: null }, state: { action: 'standing', moving: true, runMode: true } };
const controller = new MinimalMeadowCombatAnimationController(runtime);
let draws = 0;
bus.on('equipment:draw', () => { draws += 1; });
bus.emit('combat:cast-start', { duration: 2, progress: 0 });
assert.equal(controller.state, 'cast-windup');
assert.equal(controller.animationState(), 'cast-windup');
bus.emit('combat:cast-progress', { duration: 2, progress: 0.5 });
assert.equal(controller.state, 'cast-channel');
bus.emit('enemy:attack', { amount: 5 });
assert.equal(controller.state, 'cast-channel');
bus.emit('combat:cast-launch', { duration: 2 });
assert.equal(controller.state, 'cast-release');
controller.update(0.4);
assert.equal(controller.animationState(), 'running');
assert.equal(draws, 1);

bus.emit('player:attack', { attack: { windupMilliseconds: 180 } });
assert.equal(controller.state, 'melee-windup');
controller.update(0.2);
assert.equal(controller.state, 'melee-impact');
bus.emit('player:defeated', { amount: 100 });
assert.equal(controller.state, 'death');
assert.equal(controller.locked, true);
controller.destroy();

const model = fakeModel([
	'mixamorig:Spine2', 'mixamorig:Neck', 'mixamorig:Head',
	'mixamorig:LeftShoulder', 'mixamorig:LeftArm', 'mixamorig:LeftForeArm', 'mixamorig:LeftHand',
	'mixamorig:RightShoulder', 'mixamorig:RightArm', 'mixamorig:RightForeArm', 'mixamorig:RightHand'
]);
const pose = new MinimalMeadowPlayerBonePose(model);
const poseState = { duration: 2, elapsed: 1, progress: 0.5, state: 'cast-channel' };
pose.update(poseState, 0.1, false);
assert.ok(pose.diagnostics().boundBones >= 10);
assert.notEqual(model.children.at(-3).quaternion.w, 1);
poseState.state = 'standing';
for (let index = 0; index < 30; index += 1) pose.update(poseState, 0.05, false);
assert.ok(pose.diagnostics().weight < 0.01);
console.log('PLAYER_CASTING_ANIMATION_TEST_OK=1');

function fakeModel(namesValue) {
	const children = namesValue.map(name => ({ name, quaternion: quaternion() }));
	return { children, traverse(visitor) { for (const child of children) visitor(child); } };
}

function quaternion() {
	return { x: 0, y: 0, z: 0, w: 1, set(x, y, z, w) { Object.assign(this, { x, y, z, w }); } };
}
