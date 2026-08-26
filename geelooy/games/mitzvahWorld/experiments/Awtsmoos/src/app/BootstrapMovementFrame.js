// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementFrame.js
 * @description Advances one Mitzvah movement frame through shared intent, basis, acceleration, collision, and presentation.
 * The Awtsmoos gathers separate intentions into one measured journey without duplicating the law beneath the step;
 * Awtsmoos.com lets Core carry universal motion while this game keeps animation, camera, collision, and world depth.
 */

import {
	actorMovementBasis,
	advanceMovementVelocity,
	cameraMovementBasis,
	combineMovementVectors,
	movementStepFromVelocity,
	movementVectorFromBasis,
	normalizeMovementIntent
} from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { bootstrapInputAxis } from './BootstrapInputAxis.js';
import { bootstrapMovementSpeed, bootstrapTravelFacingLocked } from './BootstrapMovementPace.js';
import { bootstrapMovementAction, setBootstrapMovementYaw } from './BootstrapMovementControllerSupport.js';
import { MITZVAH_MOVEMENT_PROFILE } from './MitzvahMovementProfile.js';
import {
	applyMovementCollision,
	finishMovementVertical,
	movementAxes,
	movementModeFor,
	prepareMovementVertical,
	updateMovementCamera
} from './MitzvahMovementRuntime.js';
import {
	isMinimalMeadowMovementStep,
	retainedMinimalMeadowTravelFacing
} from './MinimalMeadowTravelFacingPolicy.js';

export function advanceBootstrapMovement(controller, deltaSeconds) {
	const runtime = controller.runtime;
	const state = runtime.state;
	runtime.cameraRig?.synchronizeFacing?.(state);
	const axis = bootstrapInputAxis(runtime);
	const axes = movementAxes(axis);
	const keyboard = normalizeMovementIntent(axes.keyboard);
	const joystick = normalizeMovementIntent(axes.joystick);
	const mouse = normalizeMovementIntent(runtime.cameraRig?.mouseMovementAxis?.());
	const movementMode = movementModeFor(runtime);
	const turnDelta = keyboard.turn * MITZVAH_MOVEMENT_PROFILE.turnSpeed * deltaSeconds;
	state.facing += turnDelta;
	runtime.cameraRig?.followTurn?.(turnDelta);
	state.runMode = movementMode.effectiveMode === 'run';
	const richVertical = prepareMovementVertical(runtime, state, deltaSeconds);
	const speed = bootstrapMovementSpeed(runtime, movementMode);
	const targetVelocity = desiredVelocity(runtime, state, keyboard, joystick, mouse, speed);
	controller.horizontalVelocity = advanceMovementVelocity(
		controller.horizontalVelocity, targetVelocity, deltaSeconds, velocityOptions(state)
	);
	const step = movementStepFromVelocity(controller.horizontalVelocity, deltaSeconds);
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

function desiredVelocity(runtime, state, keyboard, joystick, mouse, speed) {
	return combineMovementVectors(
		movementVectorFromBasis(actorMovementBasis(state.facing), keyboard, speed),
		movementVectorFromBasis(cameraMovementBasis(runtime.camera, state.facing), joystick, speed),
		movementVectorFromBasis(cameraMovementBasis(runtime.camera, state.facing), mouse, speed)
	);
}

function velocityOptions(state) {
	return {
		acceleration: state.runMode ? MITZVAH_MOVEMENT_PROFILE.runAcceleration : MITZVAH_MOVEMENT_PROFILE.walkAcceleration,
		airControl: MITZVAH_MOVEMENT_PROFILE.airControl,
		deceleration: MITZVAH_MOVEMENT_PROFILE.deceleration,
		grounded: state.grounded !== false,
		maxDeltaSeconds: MITZVAH_MOVEMENT_PROFILE.maxDeltaSeconds
	};
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
