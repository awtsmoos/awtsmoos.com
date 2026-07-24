// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMobileMovementMode.test.mjs
 * @description Proves screen-right movement, bounded diagonals, and real Walk/Run speed.
 * The Awtsmoos turns measured intention into measured travel; Awtsmoos.com keeps every sign honest.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapMovementController } from '../../app/BootstrapMovementController.js';
import {
	meadowCameraMovementStep,
	meadowMovementStep,
	normalizedMeadowIntent
} from '../../app/MinimalMeadowControlMath.js';

const CAMERA = {
	position: { x: 0, z: 10 },
	target: { x: 0, z: 0 }
};

test('camera-relative joystick signs match the screen in every cardinal direction', () => {
	const right = cameraStep(0, 1);
	const left = cameraStep(0, -1);
	const forward = cameraStep(1, 0);
	const backward = cameraStep(-1, 0);
	assert.ok(right.x > 0);
	assert.ok(left.x < 0);
	assert.ok(forward.z < 0);
	assert.ok(backward.z > 0);
	const actorRight = meadowMovementStep(0, normalizedMeadowIntent({ strafe: 1 }), 1, 1);
	assert.ok(actorRight.x > 0);
});

test('camera-relative diagonals remain normalized and preserve both signs', () => {
	const diagonal = cameraStep(1, 1);
	assert.ok(diagonal.x > 0);
	assert.ok(diagonal.z < 0);
	assert.ok(Math.hypot(diagonal.x, diagonal.z) <= 1.000001);
	const rotatedCamera = {
		position: { x: 10, z: 0 },
		target: { x: 0, z: 0 }
	};
	const screenRight = meadowCameraMovementStep(
		rotatedCamera,
		normalizedMeadowIntent({ strafe: 1 }),
		1,
		1,
		0
	);
	assert.ok(screenRight.z < 0);
});

test('selected Run changes actual speed and action for keyboard and joystick', () => {
	const walking = createRuntime(false, false);
	const running = createRuntime(true, false);
	const shifted = createRuntime(false, true);
	const walkController = new BootstrapMovementController(walking);
	const runController = new BootstrapMovementController(running);
	const shiftController = new BootstrapMovementController(shifted);
	walkController.update(1);
	runController.update(1);
	shiftController.update(1);
	assert.ok(Math.abs(running.state.x) > Math.abs(walking.state.x) * 1.5);
	assert.equal(walking.state.action, 'walk');
	assert.equal(running.state.action, 'run');
	assert.equal(runController.snapshot().selectedMode, 'run');
	assert.equal(shiftController.snapshot().selectedMode, 'walk');
	assert.equal(shiftController.snapshot().effectiveMode, 'run');
});

function cameraStep(forward, strafe) {
	return meadowCameraMovementStep(
		CAMERA,
		normalizedMeadowIntent({ forward, strafe }),
		1,
		1,
		0
	);
}

function createRuntime(runToggle, shiftOverride) {
	const state = {
		action: 'idle', airPhase: 'ground', facing: 0, grounded: true,
		jumpsUsed: 0, moving: false, renderY: 0, runMode: false,
		travelFacing: 0, velY: 0, x: 0, y: 0, z: 0
	};
	return {
		camera: CAMERA,
		cameraRig: { followTurn() {}, update() {} },
		collisionMover: {
			move(player, step) {
				player.x += step.x;
				player.z += step.z;
				return { normals: [] };
			}
		},
		input: {
			axis: () => ({
				forward: 0, joystickForward: 0, joystickMagnitude: 1,
				joystickStrafe: 1, strafe: 0, turn: 0
			}),
			consumeJump: () => false,
			runRequested: () => shiftOverride
		},
		model: new Group(),
		runToggle,
		state,
		terrain: { heightAt: () => 0 }
	};
}
