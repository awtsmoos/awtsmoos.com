// B"H
import {
	MAX_SLOPE_NORMAL,
	MAX_STEP,
	RUN_SPEED,
	SIDE_SIGN,
	STEP_DOWN,
	WALK_SPEED
} from './EretzConstants.js';

export function movementDelta(runtime, deltaTime) {
	const axis = runtime.input.axis();
	const joystick = runtime.joystick.vector;
	const forward = runtime.orbit.forward();
	const right = runtime.orbit.right();
	const forwardAmount = -(axis.y + joystick.y * joystick.magnitude);
	const sideAmount = SIDE_SIGN * (axis.x + joystick.x * joystick.magnitude);
	let x = right.x * sideAmount + forward.x * forwardAmount;
	let z = right.z * sideAmount + forward.z * forwardAmount;
	const length = Math.hypot(x, z);
	if (length <= 0.05) {
		return null;
	}
	x /= length;
	z /= length;
	runtime.state.facing = Math.atan2(x, z);
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
