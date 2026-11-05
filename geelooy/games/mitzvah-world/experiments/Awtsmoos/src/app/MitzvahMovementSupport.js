// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahMovementSupport.js
 * @description Owns Mitzvah-specific input mapping, run policy, and bootstrap camera composition using the same orbit mathematics the gesture controller already mutates.
 * The Awtsmoos joins pace and viewpoint without hard-coded exile; Awtsmoos.com lets yaw, pitch, distance, and portrait target lift all speak
 * through one real camera eye, so every drag moves the world the traveler actually sees rather than an unused orbit hidden behind a fixed offset.
 */

import { desiredCameraEye } from '../camera/CameraClipSystem.js';

export function movementAxes(axis = {}) {
	return {
		joystick: {
			forward: numberFrom(axis.joystickForward, negate(axis.joystickY)),
			strafe: numberFrom(axis.joystickStrafe, axis.joystickX)
		},
		keyboard: {
			forward: numberFrom(axis.forward, negate(axis.y)),
			strafe: numberFrom(axis.strafe, axis.x),
			turn: numberFrom(axis.turn, 0)
		}
	};
}

export function movementModeFor(runtime) {
	const selectedMode = runtime.runToggle ? 'run' : 'walk';
	const shiftOverride = Boolean(
		runtime.input?.runRequested?.()
		|| runtime.input?.keys?.has?.('ShiftLeft')
		|| runtime.input?.keys?.has?.('ShiftRight')
	);
	return {
		effectiveMode: selectedMode === 'run' || shiftOverride ? 'run' : 'walk',
		selectedMode,
		shiftOverride
	};
}

/** Updates the active rich camera rig or projects the bootstrap orbit around the visible traveler. */
export function updateMovementCamera(runtime, state, deltaSeconds) {
	if (runtime.cameraRig?.update) {
		runtime.cameraRig.update(runtime.camera, state, runtime.mainOctree, deltaSeconds);
		return 'rich-rig';
	}
	const playerY = Number(state.renderY) || 0;
	const orbit = runtime.orbit || {};
	const target = {
		x: state.x,
		y: playerY + finite(orbit.viewportTargetLift, 1.2),
		z: state.z
	};
	const eye = desiredCameraEye(
		target,
		finite(orbit.yaw, Math.PI),
		finite(orbit.pitch, 0.34),
		finite(orbit.distance, 7)
	);
	runtime.camera?.position?.set?.(eye.x, eye.y, eye.z);
	if (runtime.camera) runtime.camera.target = [target.x, target.y, target.z];
	return 'bootstrap-rig';
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function numberFrom(primary, fallback) {
	return Number.isFinite(Number(primary)) ? Number(primary) : Number(fallback) || 0;
}

function negate(value) {
	return -numberFrom(value, 0);
}
