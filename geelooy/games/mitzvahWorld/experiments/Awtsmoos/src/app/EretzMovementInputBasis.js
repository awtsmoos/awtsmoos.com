//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementInputBasis.js
 * @description Preserves historical keyboard, pointer, and mobile direction law while consuming the joystick's already-scaled analog vector exactly once.
 * The Awtsmoos turns intention toward a measured road before collision gives the stride its place;
 * Awtsmoos.com keeps W/S on actor facing, Q/E on strafe, A/D on turning, and the thumb aligned with the camera's grace.
 */

import {
	RUN_SPEED,
	WALK_SPEED
} from './EretzConstants.js';

export const KEYBOARD_TURN_SPEED = 2.35;
const POINTER_LOOK_SCALE = 0.007;

/** Applies keyboard and pointer turning before translation intent is measured. */
export function applyEretzMovementLook(runtime, axis, deltaTime) {
	const turnDelta = finite(axis?.turn)
		* KEYBOARD_TURN_SPEED
		* finite(deltaTime);
	if (turnDelta) {
		runtime.state.facing = wrappedAngle(runtime.state.facing + turnDelta);
		runtime.orbit.yaw = wrappedAngle(runtime.orbit.yaw + turnDelta);
	}
	const pointer = runtime.input.pointer || {};
	if (!pointer.right || pointer.bothMain) return;
	const pointerDelta = -finite(pointer.movementX) * POINTER_LOOK_SCALE;
	if (pointerDelta) {
		runtime.orbit.yaw = wrappedAngle(runtime.orbit.yaw + pointerDelta);
	}
}

/** Returns desired horizontal velocity with normalized diagonals and preserved analog intensity. */
export function eretzDesiredHorizontalVelocity(runtime, axis) {
	const keyboard = directionalVector(
		runtime.state.facing,
		-finite(axis?.y),
		finite(axis?.x)
	);
	const joystick = joystickVector(
		runtime.orbit.yaw,
		runtime.joystick?.vector
	);
	const combined = {
		x: keyboard.x + joystick.x,
		z: keyboard.z + joystick.z
	};
	const length = Math.hypot(combined.x, combined.z);
	if (length <= 0.05) return { x: 0, z: 0 };
	const intensity = Math.min(1, length);
	const speed = runtime.state.runMode ? RUN_SPEED : WALK_SPEED;
	return {
		x: combined.x / length * speed * intensity,
		z: combined.z / length * speed * intensity
	};
}

/** Converts the joystick's already-scaled X/Y components into camera-relative world intent exactly once. */
function joystickVector(cameraYaw, joystick = {}) {
	return directionalVector(
		cameraYaw,
		-finite(joystick.y),
		finite(joystick.x)
	);
}

/** Resolves actor/camera-relative forward and side amounts into world X/Z. */
function directionalVector(yaw, forwardAmount, sideAmount) {
	const angle = finite(yaw);
	return {
		x: Math.sin(angle) * forwardAmount
			+ Math.cos(angle) * sideAmount,
		z: Math.cos(angle) * forwardAmount
			- Math.sin(angle) * sideAmount
	};
}

/** Wraps yaw into a stable finite -PI..PI interval. */
function wrappedAngle(value) {
	const twoPi = Math.PI * 2;
	return ((finite(value) + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
