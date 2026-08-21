// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementInput.js
 * @description Restores historical tank-style keyboard travel while preserving modern joystick and pointer sight.
 * The Awtsmoos turns the traveler continuously and lets the witness follow each measured degree;
 * Awtsmoos.com keeps Q/E as true stride, W/S on player facing, and touch free to follow the camera it can see.
 */

import {
	MAX_SLOPE_NORMAL,
	MAX_STEP,
	RUN_SPEED,
	STEP_DOWN,
	WALK_SPEED
} from './EretzConstants.js';

export const KEYBOARD_TURN_SPEED = 2.35;
const POINTER_LOOK_SCALE = 0.007;

/**
 * Advances held-key turn before deriving translation, matching the historical per-frame rotation law.
 * Keyboard movement follows player facing; joystick movement remains camera-relative for touch ergonomics.
 */
export function movementDelta(runtime, deltaTime) {
	const axis = runtime.input.axis();
	applyKeyboardTurn(runtime, axis.turn, deltaTime);
	applyPointerLook(runtime);
	const keyboard = keyboardVector(runtime.state.facing, axis);
	const joystick = joystickVector(runtime.orbit.yaw, runtime.joystick.vector);
	const combined = {
		x: keyboard.x + joystick.x,
		z: keyboard.z + joystick.z
	};
	const length = Math.hypot(combined.x, combined.z);
	if (length <= 0.05) return null;
	const speed = runtime.state.runMode ? RUN_SPEED : WALK_SPEED;
	return {
		x: combined.x / length * deltaTime * speed,
		z: combined.z / length * deltaTime * speed
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

function applyKeyboardTurn(runtime, turn, deltaTime) {
	const turnDelta = finite(turn) * KEYBOARD_TURN_SPEED * finite(deltaTime);
	if (!turnDelta) return;
	runtime.state.facing = wrappedAngle(runtime.state.facing + turnDelta);
	runtime.orbit.yaw = wrappedAngle(runtime.orbit.yaw + turnDelta);
}

function applyPointerLook(runtime) {
	const pointer = runtime.input.pointer || {};
	if (!pointer.right || pointer.bothMain) return;
	const turnDelta = -finite(pointer.movementX) * POINTER_LOOK_SCALE;
	if (turnDelta) runtime.orbit.yaw = wrappedAngle(runtime.orbit.yaw + turnDelta);
}

function keyboardVector(facingYaw, axis) {
	return directionalVector(
		facingYaw,
		-finite(axis.y),
		finite(axis.x)
	);
}

function joystickVector(cameraYaw, joystick = {}) {
	const magnitude = Math.max(0, Math.min(1, finite(joystick.magnitude)));
	return directionalVector(
		cameraYaw,
		-finite(joystick.y) * magnitude,
		finite(joystick.x) * magnitude
	);
}

function directionalVector(yaw, forwardAmount, sideAmount) {
	const angle = finite(yaw);
	return {
		x: Math.sin(angle) * forwardAmount + Math.cos(angle) * sideAmount,
		z: Math.cos(angle) * forwardAmount - Math.sin(angle) * sideAmount
	};
}

function wrappedAngle(value) {
	const twoPi = Math.PI * 2;
	return ((finite(value) + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
