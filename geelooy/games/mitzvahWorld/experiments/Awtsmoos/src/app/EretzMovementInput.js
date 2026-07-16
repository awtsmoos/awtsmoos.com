// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementInput.js
 * @description Converts standard first-person input into camera-relative player movement.
 * RESPONSIBILITY: synchronize facing with view yaw and calculate normalized WASD/joystick deltas.
 * NON-RESPONSIBILITY: this module does not resolve collision, animation, or rendering quality.
 * ARCHITECTURE: Tiferes joins seeing and walking while Gevurah normalizes speed and slopes.
 * OROS AND KEILIM: embodied direction is ohr; facing vectors and bounded deltas are keilim.
 * The Awtsmoos creates sight and motion as one mission; Awtsmoos.com lets the shliach walk
 * exactly where the first-person camera looks without removing legacy orbit compatibility.
 */

import {
	MAX_SLOPE_NORMAL,
	MAX_STEP,
	RUN_SPEED,
	SIDE_SIGN,
	STEP_DOWN,
	WALK_SPEED
} from './EretzConstants.js';

const KEYBOARD_LOOK_SPEED = 2.85;

export function movementDelta(runtime, deltaTime) {
	const axis = runtime.input.axis();
	applyViewRotation(runtime, axis, deltaTime);
	const joystick = runtime.joystick.vector;
	const facingYaw = movementFacing(runtime);
	const facing = playerFacing(facingYaw);
	const right = { x: Math.cos(facingYaw), z: -Math.sin(facingYaw) };
	const forwardAmount = -(axis.y + joystick.y * joystick.magnitude);
	const sideAmount = movementSideSign(runtime)
		* (axis.x + joystick.x * joystick.magnitude);
	let x = right.x * sideAmount + facing.x * forwardAmount;
	let z = right.z * sideAmount + facing.z * forwardAmount;
	const length = Math.hypot(x, z);
	if (length <= 0.05) {
		return null;
	}
	x /= length;
	z /= length;
	runtime.state.facing = facingYaw;
	const speed = runtime.state.runMode ? RUN_SPEED : WALK_SPEED;
	return {
		x: x * deltaTime * speed,
		z: z * deltaTime * speed
	};
}

export function stepStateFor(state, target, difference) {
	if (state.grounded && target.normal.y < MAX_SLOPE_NORMAL && difference > 0.015) {
		return 'too-steep';
	}
	if (state.grounded && difference > 0.02 && difference <= MAX_STEP) {
		return 'up';
	}
	if (state.grounded && difference < -0.02 && difference >= -STEP_DOWN) {
		return 'down';
	}
	if (state.grounded && difference < -STEP_DOWN) {
		return 'ledge';
	}
	return 'flat';
}

function applyViewRotation(runtime, axis, deltaTime) {
	const keyboardLook = axis.turn * KEYBOARD_LOOK_SPEED * deltaTime;
	if (keyboardLook) {
		runtime.orbit.yaw += keyboardLook;
	}
	if (!runtime.orbit.isFirstPerson?.()) {
		applyLegacyPlayerRotation(runtime, axis, deltaTime);
	}
}

function applyLegacyPlayerRotation(runtime, axis, deltaTime) {
	const pointer = runtime.input.pointer || {};
	const rightDragTurn = pointer.right && !pointer.bothMain
		? -(pointer.movementX || 0) * 0.007
		: 0;
	const keyboardTurn = axis.turn * KEYBOARD_LOOK_SPEED * deltaTime;
	if (keyboardTurn || rightDragTurn) {
		runtime.state.facing += keyboardTurn + rightDragTurn;
	}
	if (pointer.bothMain) {
		runtime.state.facing = runtime.orbit.yaw;
	}
}

function movementFacing(runtime) {
	return runtime.orbit.isFirstPerson?.()
		? runtime.orbit.yaw
		: runtime.state.facing;
}

function movementSideSign(runtime) {
	return runtime.orbit.isFirstPerson?.() ? 1 : SIDE_SIGN;
}

function playerFacing(yaw) {
	return { x: Math.sin(yaw), z: Math.cos(yaw) };
}
