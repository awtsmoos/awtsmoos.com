// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementFrame.js
 * @description Advances one immediate-play movement frame with keyboard, floating joystick, camera, collision, and facing.
 * The Awtsmoos gathers separate intentions into one measured step, yet each vessel keeps its name;
 * Awtsmoos.com lets the first touch move the traveler now, before later worlds inherit the same flame.
 */

import { bootstrapInputAxis } from './BootstrapInputAxis.js';
import {
	bootstrapMovementSpeed,
	bootstrapTravelFacingLocked
} from './BootstrapMovementPace.js';
import {
	bootstrapMovementAction,
	setBootstrapMovementYaw
} from './BootstrapMovementControllerSupport.js';
import {
	combineMeadowSteps,
	meadowCameraMovementStep,
	meadowMovementStep,
	normalizedMeadowIntent
} from './MinimalMeadowControlMath.js';
import {
	applyMovementCollision,
	finishMovementVertical,
	movementAxes,
	movementModeFor,
	prepareMovementVertical,
	updateMovementCamera
} from './MinimalMeadowMovementRuntime.js';
import {
	isMinimalMeadowMovementStep,
	retainedMinimalMeadowTravelFacing
} from './MinimalMeadowTravelFacingPolicy.js';

const TURN_SPEED = 2.35;

/**
 * Advances one bootstrap movement frame and records diagnostics on the controller.
 * @param {object} controller Bootstrap movement controller instance.
 * @param {number} deltaSeconds Clamped frame duration in seconds.
 * @returns {object} Mutated canonical player state.
 */
export function advanceBootstrapMovement(controller, deltaSeconds) {
	const runtime = controller.runtime;
	const state = runtime.state;
	runtime.cameraRig?.synchronizeFacing?.(state);
	const axis = bootstrapInputAxis(runtime);
	const axes = movementAxes(axis);
	const keyboard = normalizedMeadowIntent(axes.keyboard);
	const joystick = normalizedMeadowIntent(axes.joystick);
	const mouse = normalizedMeadowIntent(runtime.cameraRig?.mouseMovementAxis?.());
	const movementMode = movementModeFor(runtime);
	const turnDelta = keyboard.turn * TURN_SPEED * deltaSeconds;
	state.facing += turnDelta;
	runtime.cameraRig?.followTurn?.(turnDelta);
	state.runMode = movementMode.effectiveMode === 'run';
	const richVertical = prepareMovementVertical(runtime, state, deltaSeconds);
	const speed = bootstrapMovementSpeed(runtime, movementMode);
	const step = combinedStep(runtime, state, keyboard, joystick, mouse, speed, deltaSeconds);
	applyMovementCollision(runtime, state, step);
	finishMovementVertical(runtime, state, richVertical);
	settleFacing(runtime, state, keyboard, step);
	settlePresentation(runtime, state);
	const cameraMode = updateMovementCamera(runtime, state, deltaSeconds);
	runtime.multiplayerBridge?.update?.(deltaSeconds, state);
	controller.distance += Math.hypot(step.x, step.z);
	controller.frames += 1;
	controller.lastIntent = { axis, cameraMode, joystick, keyboard, mouse, movementMode };
	return state;
}

function combinedStep(runtime, state, keyboard, joystick, mouse, speed, deltaSeconds) {
	return combineMeadowSteps(
		meadowMovementStep(state.facing, keyboard, speed, deltaSeconds),
		meadowCameraMovementStep(runtime.camera, joystick, speed, deltaSeconds, state.facing),
		meadowCameraMovementStep(runtime.camera, mouse, speed, deltaSeconds, state.facing)
	);
}

function settleFacing(runtime, state, keyboard, step) {
	state.moving = isMinimalMeadowMovementStep(step);
	state.travelFacing = bootstrapTravelFacingLocked(runtime, keyboard)
		? state.facing
		: retainedMinimalMeadowTravelFacing(step, state.travelFacing, state.facing);
	state.action = bootstrapMovementAction(state);
}

function settlePresentation(runtime, state) {
	runtime.model.position.set(state.x, state.renderY, state.z);
	setBootstrapMovementYaw(runtime.model.quaternion, state.travelFacing);
	runtime.equipment?.update?.();
}
