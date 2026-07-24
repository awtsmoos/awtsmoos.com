// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMovementRuntime.js
 * @description Bridges first-frame and hydrated movement contracts without duplicating authority.
 * The Awtsmoos recreates bright fallback and rich world as one unfolding truth; Awtsmoos.com
 * keeps axes, ground, collision, camera, and selected pace faithful through every hydration gate.
 */

import {
	finishMinimalMeadowVertical,
	prepareMinimalMeadowVertical
} from './MinimalMeadowJumpState.js';

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
	const effectiveMode = selectedMode === 'run' || shiftOverride ? 'run' : 'walk';
	return { effectiveMode, selectedMode, shiftOverride };
}

export function prepareMovementVertical(runtime, state, deltaSeconds) {
	if (supportsRichVertical(runtime)) {
		prepareMinimalMeadowVertical(runtime, state, deltaSeconds);
		return true;
	}
	const ground = terrainHeight(runtime, state);
	state.renderY = Number.isFinite(state.renderY) ? state.renderY : ground;
	state.y = Number.isFinite(state.y) ? state.y : ground;
	state.grounded = state.grounded !== false;
	return false;
}

export function finishMovementVertical(runtime, state, richVertical) {
	if (richVertical) {
		finishMinimalMeadowVertical(runtime, state);
		return;
	}
	if (!state.grounded) return;
	const ground = terrainHeight(runtime, state);
	state.groundY = ground;
	state.renderY = ground;
	state.y = ground;
}

export function applyMovementCollision(runtime, state, step) {
	if (!runtime.collisionMover?.move) {
		state.x += step.x;
		state.z += step.z;
		return;
	}
	const result = runtime.collisionMover.move(state, step, {
		blockSteepFloors: false,
		floorY: terrainHeight(runtime, state),
		grounded: state.grounded,
		maxStepHeight: 0.42,
		maxSlopeNormal: 0.58
	});
	state.contacts = result.normals || [];
}

export function updateMovementCamera(runtime, state, deltaSeconds) {
	if (runtime.cameraRig?.update) {
		runtime.cameraRig.update(runtime.camera, state, runtime.mainOctree, deltaSeconds);
		return 'rich-rig';
	}
	const playerY = Number(state.renderY) || 0;
	runtime.camera?.position?.set?.(state.x, playerY + 4.2, state.z + 7);
	if (runtime.camera) {
		runtime.camera.target = [state.x, playerY + 1.2, state.z];
	}
	return 'bootstrap-rig';
}

function supportsRichVertical(runtime) {
	return Boolean(runtime.terrain?.heightAt && runtime.input?.consumeJump);
}

function terrainHeight(runtime, state) {
	return Number(runtime.terrain?.heightAt?.(state.x, state.z)) || 0;
}

function numberFrom(primary, fallback) {
	return Number.isFinite(Number(primary)) ? Number(primary) : Number(fallback) || 0;
}

function negate(value) {
	return -numberFrom(value, 0);
}
