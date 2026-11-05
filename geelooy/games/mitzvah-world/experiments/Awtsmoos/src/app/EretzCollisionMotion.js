// B"H
import {
	MAX_SLOPE_NORMAL,
	MAX_STEP,
	PLAYER_RADIUS
} from './EretzConstants.js';
import { movementDelta, stepStateFor } from './EretzMovementInput.js';
import {
	applyWalkableStep,
	findWalkableStep
} from '../collision/StepUpResolver.js';

export function updateHorizontalMotion(runtime, deltaTime) {
	const delta = movementDelta(runtime, deltaTime);
	const state = runtime.state;
	state.moving = !!delta;
	if (!delta) {
		return;
	}
	const oldPosition = { x: state.x, y: state.y, z: state.z };
	const step = findWalkableStep({
		ground: runtime.ground,
		position: state,
		delta,
		footOffset: runtime.footOffset,
		radius: PLAYER_RADIUS,
		maxStep: MAX_STEP,
		maxSlopeNormal: MAX_SLOPE_NORMAL
	});
	state.stepState = stepStateFor(state, step || fallbackGround(runtime, delta), step?.rise ?? 0);
	applyWalkableStep(state, step, runtime.footOffset);
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

function fallbackGround(runtime, delta) {
	const feetY = runtime.state.y - runtime.footOffset;
	return runtime.ground.sample(
		runtime.state.x + delta.x,
		runtime.state.z + delta.z,
		{ maxY: feetY + MAX_STEP + 0.025 }
	);
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
	const feetY = state.y - runtime.footOffset;
	const landed = runtime.ground.sample(state.x, state.z, {
		maxY: feetY + MAX_STEP + 0.025
	});
	const floorY = landed.height + runtime.footOffset;
	if (
		state.grounded
		&& Math.abs(floorY - state.y) <= MAX_STEP + 0.02
		&& landed.normal.y >= MAX_SLOPE_NORMAL
	) {
		state.y = floorY;
	}
}
