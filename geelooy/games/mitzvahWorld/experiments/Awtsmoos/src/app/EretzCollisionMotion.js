// B"H
import {
	MAX_SLOPE_NORMAL,
	MAX_STEP
} from './EretzConstants.js';
import {
	movementDelta,
	stepStateFor
} from './EretzMovementInput.js';

export function updateHorizontalMotion(runtime, deltaTime) {
	const delta = movementDelta(runtime, deltaTime);
	const state = runtime.state;
	state.moving = !!delta;
	if (!delta) {
		return;
	}
	const oldPosition = { x: state.x, y: state.y, z: state.z };
	const target = runtime.ground.sample(state.x + delta.x, state.z + delta.z);
	const difference = target.height + runtime.footOffset - state.y;
	state.stepState = stepStateFor(state, target, difference);
	if (state.stepState === 'up' || state.stepState === 'down') {
		state.y = target.height + runtime.footOffset;
	}
	if (state.stepState === 'ledge') {
		state.grounded = false;
	}
	runtime.mover.move(state, delta, wallOptions(runtime, MAX_STEP, true));
	if (headBlocked(runtime)) {
		Object.assign(state, oldPosition, { stepState: 'head-block' });
	}
	snapToWalkableGround(runtime);
	state.contacts = [...new Set([
		...runtime.mover.lastContacts,
		state.ceilingHit
	].filter(Boolean))].slice(0, 8);
	state.normals = runtime.mover.lastNormals.slice(-4);
}

export function wallOptions(runtime, stepHeight, blockSteepFloors) {
	const state = runtime.state;
	return {
		grounded: state.grounded,
		maxStepHeight: stepHeight,
		floorY: state.y - runtime.footOffset,
		maxSlopeNormal: MAX_SLOPE_NORMAL,
		blockSteepFloors,
		dynamicColliders: state.level === 'eretz'
			? runtime.doors.flatMap((door) => door.activeColliders())
			: []
	};
}

export function resolveCeiling(runtime) {
	const state = runtime.state;
	state.ceilingHit = null;
	if (state.velY <= 0 && state.grounded) {
		return;
	}
	const collision = runtime.mover.resolveCeiling(
		state,
		wallOptions(runtime, MAX_STEP, true)
	);
	if (!collision.hit) {
		return;
	}
	state.ceilingHit = collision.kind;
	state.velY = Math.min(state.velY, -1.45);
	state.grounded = false;
	state.airPhase = 'fall';
}

function headBlocked(runtime) {
	if (!runtime.state.grounded) {
		return false;
	}
	const hit = runtime.mover.ceilingHit(
		runtime.state,
		wallOptions(runtime, MAX_STEP, true)
	);
	runtime.state.ceilingHit = hit?.kind || null;
	return !!hit;
}

function snapToWalkableGround(runtime) {
	const state = runtime.state;
	const landed = runtime.ground.sample(state.x, state.z);
	const floorY = landed.height + runtime.footOffset;
	if (
		state.grounded
		&& Math.abs(floorY - state.y) <= MAX_STEP
		&& landed.normal.y >= MAX_SLOPE_NORMAL
	) {
		state.y = floorY;
	}
}
