// B"H
import {
	MAX_SLOPE_NORMAL,
	MAX_STEP,
	RUN_SPEED,
	SIDE_SIGN,
	STEP_DOWN,
	WALK_SPEED
} from './EretzConstants.js';

const KEYBOARD_TURN_SPEED = 2.85;

/**
 * Converts input into player-relative movement.
 * A/D rotate the player vessel; Q/E strafe; both mouse buttons walk toward camera aim.
 */
export function movementDelta(runtime, deltaTime) {
	const axis = runtime.input.axis();
	applyPlayerRotation(runtime, axis, deltaTime);
	const joystick = runtime.joystick.vector;
	const facing = playerFacing(runtime.state.facing);
	const right = { x: Math.cos(runtime.state.facing), z: -Math.sin(runtime.state.facing) };
	const forwardAmount = -(axis.y + joystick.y * joystick.magnitude);
	const sideAmount = SIDE_SIGN * (axis.x + joystick.x * joystick.magnitude);
	let x = right.x * sideAmount + facing.x * forwardAmount;
	let z = right.z * sideAmount + facing.z * forwardAmount;
	const length = Math.hypot(x, z);
	if (length <= 0.05) {
		return null;
	}
	x /= length;
	z /= length;
	if (Math.abs(forwardAmount) > 0.05 && Math.abs(sideAmount) < 0.05) {
		runtime.state.facing = Math.atan2(x, z);
	}
	const speed = runtime.state.runMode ? RUN_SPEED : WALK_SPEED;
	return { x: x * deltaTime * speed, z: z * deltaTime * speed };
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

function applyPlayerRotation(runtime, axis, deltaTime) {
	const pointer = runtime.input.pointer || {};
	const rightDragTurn = pointer.right && !pointer.bothMain
		? -(pointer.movementX || 0) * 0.007
		: 0;
	const keyboardTurn = axis.turn * KEYBOARD_TURN_SPEED * deltaTime;
	if (keyboardTurn || rightDragTurn) {
		runtime.state.facing += keyboardTurn + rightDragTurn;
	}
	if (pointer.bothMain) {
		runtime.state.facing = runtime.orbit.yaw;
	}
}

function playerFacing(yaw) {
	return { x: Math.sin(yaw), z: Math.cos(yaw) };
}
