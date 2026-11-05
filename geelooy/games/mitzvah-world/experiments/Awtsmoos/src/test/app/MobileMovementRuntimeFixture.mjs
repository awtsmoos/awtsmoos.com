//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MobileMovementRuntimeFixture.mjs
 * @description Builds small current-runtime fixtures for camera-relative MitzvahWorld movement tests.
 * The Awtsmoos renews each finite vessel so a test may follow the living game's stream;
 * Awtsmoos.com keeps camera, intent, collision, and pace aligned without reviving a vanished seam.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapMovementController } from '../../app/BootstrapMovementController.js';

export const FRAME_SECONDS = 1 / 60;

const CAMERA = Object.freeze({
	position: Object.freeze({ x: 0, z: 10 }),
	target: Object.freeze({ x: 0, z: 0 })
});

/**
 * @description Creates canonical grounded state for controller-level mobile movement tests.
 * @returns {object} Fresh player state.
 */
function createPlayerState() {
	return {
		action: 'idle',
		airPhase: 'ground',
		facing: 0,
		grounded: true,
		jumpsUsed: 0,
		moving: false,
		renderY: 0,
		runMode: false,
		travelFacing: 0,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}

/**
 * @description Creates a mobile-oriented runtime using current input and movement contracts.
 * @param {object} axis Semantic keyboard and joystick axis values.
 * @param {boolean} runToggle Whether persistent Run mode is selected.
 * @param {boolean} shiftOverride Whether temporary Shift run is requested.
 * @returns {object} Minimal playable movement runtime.
 */
export function createMobileMovementRuntime(axis, runToggle = false, shiftOverride = false) {
	return {
		camera: CAMERA,
		cameraRig: {
			followTurn() {},
			update() {}
		},
		collisionMover: {
			move(player, step) {
				player.x += step.x;
				player.z += step.z;
				return { normals: [] };
			}
		},
		input: {
			axis: () => axis,
			consumeJump: () => false,
			runRequested: () => shiftOverride
		},
		model: new Group(),
		runToggle,
		state: createPlayerState(),
		terrain: { heightAt: () => 0 }
	};
}

/**
 * @description Advances one runtime through a bounded number of sixty-Hz frames.
 * @param {object} runtime Runtime under test.
 * @param {number} frames Number of frames to simulate.
 * @returns {BootstrapMovementController} Advanced controller for snapshot inspection.
 */
export function advanceMobileMovementRuntime(runtime, frames = 1) {
	const controller = new BootstrapMovementController(runtime);

	for (let frame = 0; frame < frames; frame += 1) {
		controller.update(FRAME_SECONDS);
	}

	return controller;
}

/**
 * @description Creates a canonical full-strength joystick axis record.
 * @param {number} forward Forward/backward joystick intent.
 * @param {number} strafe Left/right joystick intent.
 * @returns {object} Complete axis record consumed by Bootstrap input composition.
 */
export function mobileJoystickAxis(forward, strafe) {
	return {
		forward: 0,
		joystickForward: forward,
		joystickMagnitude: Math.min(1, Math.hypot(forward, strafe)),
		joystickStrafe: strafe,
		strafe: 0,
		turn: 0
	};
}
