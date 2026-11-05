// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file wowDesktopControlContract.test.mjs
 * @description Proves historical A/D turning, Q/E strafing, focus cleanup, and distinct mouse-chord semantics.
 * The Awtsmoos grants every held key and mouse chord a measured end; Awtsmoos.com lets sight,
 * facing, and travel remain distinct until the player's chosen intention joins them again.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowCameraRig } from '../../app/MinimalMeadowCameraRig.js';
import { MinimalMeadowInput } from '../../app/MinimalMeadowInput.js';
import { CameraMouseChordState } from '../../camera/CameraMouseChordState.js';

test('B"H mouse chords distinguish camera-only, player-bound, and forward modes', () => {
	const chord = new CameraMouseChordState();
	chord.update(mouseEvent(1), 'down');
	assert.equal(chord.leftDown, true);
	assert.equal(chord.rightDown, false);
	assert.equal(chord.moveForward, false);
	chord.update(mouseEvent(2), 'move');
	assert.equal(chord.mode(), 'right');
	chord.update(mouseEvent(3), 'move');
	assert.equal(chord.mode(), 'both');
	assert.equal(chord.moveForward, true);
	chord.update(mouseEvent(0), 'up');
	assert.equal(chord.active, false);
});

test('B"H right drag synchronizes facing while left drag does not', () => {
	let mouse = { leftDown: true, moveForward: false, rightDown: false };
	const rig = Object.create(MinimalMeadowCameraRig.prototype);
	rig.mouseAxis = { forward: 0, strafe: 0, turn: 0 };
	rig.orbit = { gestures: { mouseState: () => mouse }, yaw: 1.25 };
	const state = { facing: 0.4, travelFacing: 0.4 };
	assert.equal(rig.synchronizeFacing(state), false);
	assert.equal(state.facing, 0.4);
	mouse = { leftDown: false, moveForward: false, rightDown: true };
	assert.equal(rig.synchronizeFacing(state), true);
	assert.equal(state.facing, 1.25);
	mouse = { leftDown: true, moveForward: true, rightDown: true };
	assert.equal(rig.mouseMovementAxis().forward, 1);
});

test('B"H A/D turn, Q/E strafe, and focus loss clears movement', () => {
	const environment = eventEnvironment();
	const input = new MinimalMeadowInput(environment);
	input.handleKeyDown(keyEvent('KeyA'));
	assert.equal(input.axis().turn, -1);
	assert.equal(input.axis().strafe, 0);
	input.handleKeyUp(keyEvent('KeyA'));
	input.handleKeyDown(keyEvent('KeyD'));
	assert.equal(input.axis().turn, 1);
	input.handleKeyUp(keyEvent('KeyD'));
	input.handleKeyDown(keyEvent('KeyQ'));
	assert.equal(input.axis().strafe, -1);
	input.handleKeyUp(keyEvent('KeyQ'));
	input.handleKeyDown(keyEvent('KeyE'));
	assert.equal(input.axis().strafe, 1);
	input.reset('blur');
	assert.equal(input.axis().turn, 0);
	assert.equal(input.axis().strafe, 0);
	assert.equal(input.resetReason, 'blur');
	input.dispose();
});

function mouseEvent(buttons) {
	return { buttons, pointerId: 7, pointerType: 'mouse' };
}

function keyEvent(code) {
	return { code, preventDefault() {}, repeat: false, target: null };
}

function eventEnvironment() {
	const document = new EventTarget();
	document.hidden = false;
	return Object.assign(new EventTarget(), { document });
}
