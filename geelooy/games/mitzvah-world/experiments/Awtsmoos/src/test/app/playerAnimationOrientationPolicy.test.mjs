// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerAnimationOrientationPolicy.test.mjs
 * @description Verifies grounded fall rejection, locomotion-under-cast, and strict world-up roots.
 * The Awtsmoos gives ascent and landing distinct truth; Awtsmoos.com keeps living grounded
 * players upright while imported jump and fall remain authoritative in the air.
 */

import assert from 'node:assert/strict';
import {
	minimalMeadowClipForState,
	minimalMeadowLocomotionState
} from '../../app/MinimalMeadowAnimationClipPolicy.js';
import {
	minimalMeadowImportedAnimationState,
	minimalMeadowRootUpDot,
	stabilizeMinimalMeadowLivingRoot
} from '../../app/MinimalMeadowAnimationComposition.js';

const names = [
	'stand_Armature', 'walk_Armature', 'run_Armature',
	'jump_Armature', 'falling_Armature'
];
assertState({ action: 'falling', grounded: true, moving: false }, 'standing');
assertState({ action: 'falling', grounded: true, moving: true }, 'walking');
assertState({ action: 'falling', grounded: true, moving: true, runMode: true }, 'running');
assertState({ action: 'jump-one', grounded: false, velY: 5 }, 'jumping');
assertState({ action: 'falling', grounded: false, velY: -5 }, 'falling');

for (const [moving, runMode, expected] of [
	[false, false, 'standing'],
	[true, false, 'walking'],
	[true, true, 'running']
]) {
	const runtime = { state: { grounded: true, moving, runMode } };
	const animation = { actions: { runtime: { active: null } } };
	assert.equal(minimalMeadowImportedAnimationState(runtime, animation, 'cast-channel'), expected);
}
const actionRuntime = { state: { grounded: true, moving: true, runMode: true } };
const activeAnimation = {
	actions: { runtime: { active: { definition: { layer: 'upper-body' } } } }
};
assert.equal(minimalMeadowImportedAnimationState(actionRuntime, activeAnimation, 'running'), 'running');

const model = { quaternion: quaternion(0.5, 0.5, 0.5, 0.5) };
const living = { model, state: { grounded: true, health: 10 } };
assert.equal(stabilizeMinimalMeadowLivingRoot(living, 'running'), true);
assert.ok(minimalMeadowRootUpDot(living) >= 1 - 1e-12);
const airborne = { model: { quaternion: quaternion(0.5, 0.5, 0.5, 0.5) }, state: { grounded: false, health: 10 } };
assert.equal(stabilizeMinimalMeadowLivingRoot(airborne, 'falling'), false);
assert.ok(minimalMeadowRootUpDot(airborne) < 1);
const defeated = { model: { quaternion: quaternion(0.5, 0.5, 0.5, 0.5) }, state: { grounded: true, health: 0 } };
assert.equal(stabilizeMinimalMeadowLivingRoot(defeated, 'death'), false);
console.log('PLAYER_ANIMATION_ORIENTATION_POLICY_TEST_OK=1');

function assertState(state, expected) {
	const runtime = { state };
	const actual = minimalMeadowLocomotionState(runtime);
	assert.equal(actual, expected);
	assert.equal(minimalMeadowClipForState(names, actual), expectedClip(expected));
}

function expectedClip(state) {
	return {
		falling: 'falling_Armature',
		jumping: 'jump_Armature',
		running: 'run_Armature',
		standing: 'stand_Armature',
		walking: 'walk_Armature'
	}[state];
}

function quaternion(x, y, z, w) {
	return { w, x, y, z, set(nextX, nextY, nextZ, nextW) { Object.assign(this, { w: nextW, x: nextX, y: nextY, z: nextZ }); } };
}
