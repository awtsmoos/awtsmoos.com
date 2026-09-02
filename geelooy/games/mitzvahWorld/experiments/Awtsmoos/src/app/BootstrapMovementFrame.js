// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementFrame.js
 * @description Coordinates one responsive player frame while preserving one canonical visible facing across movement and animation presentation.
 * Netzach carries intention into motion while Tiferes joins collision, facing, and camera in one measured light;
 * the Awtsmoos renews traveler and direction each instant, and Awtsmoos.com keeps later presentation from undoing the path made right.
 */

import { normalizeMovementIntent } from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementIntent.js';
import { movementStepFromVelocity } from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementStep.js';
import { advanceMovementVelocity } from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementVelocity.js';
import { bootstrapInputAxis } from './BootstrapInputAxis.js';
import { settleBootstrapMovementFacing } from './BootstrapMovementFacing.js';
import { bootstrapMovementSpeed } from './BootstrapMovementPace.js';
import { setBootstrapMovementYaw } from './BootstrapMovementControllerSupport.js';
import { bootstrapDesiredVelocity, bootstrapVelocityOptions } from './BootstrapMovementVelocity.js';
import { MITZVAH_MOVEMENT_PROFILE } from './MitzvahMovementProfile.js';
import {
	applyMovementCollision,
	finishMovementVertical,
	movementAxes,
	movementModeFor,
	prepareMovementVertical,
	updateMovementCamera
} from './MitzvahMovementRuntime.js';

/**
 * Advances one complete player-control frame from fresh input through settled camera presentation.
 * @param {BootstrapMovementController} controller Active movement controller.
 * @param {number} deltaSeconds Frame delta in seconds.
 * @returns {object} Canonical player state.
 */
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
	const turnDelta = keyboard.turn
		* MITZVAH_MOVEMENT_PROFILE.turnSpeed
		* deltaSeconds;
	state.facing += turnDelta;
	runtime.cameraRig?.followTurn?.(turnDelta);
	state.runMode = movementMode.effectiveMode === 'run';
	const richVertical = prepareMovementVertical(runtime, state, deltaSeconds);
	const speed = bootstrapMovementSpeed(runtime, movementMode);
	const targetVelocity = bootstrapDesiredVelocity(
		runtime,
		state,
		keyboard,
		joystick,
		mouse,
		speed
	);
	controller.horizontalVelocity = advanceMovementVelocity(
		controller.horizontalVelocity,
		targetVelocity,
		deltaSeconds,
		bootstrapVelocityOptions(state)
	);
	const step = movementStepFromVelocity(
		controller.horizontalVelocity,
		deltaSeconds
	);
	applyMovementCollision(runtime, state, step);
	finishMovementVertical(runtime, state, richVertical);
	settleBootstrapMovementFacing(runtime, state, keyboard, step);
	settlePresentation(runtime, state);
	const cameraMode = updateMovementCamera(runtime, state, deltaSeconds);
	runtime.multiplayerBridge?.update?.(deltaSeconds, state);
	controller.distance += Math.hypot(step.x, step.z);
	controller.frames += 1;
	controller.lastIntent = {
		axis,
		cameraMode,
		joystick,
		keyboard,
		mouse,
		movementMode
	};
	return state;
}

/** Applies the same canonical facing that animation presentation will use moments later. */
function settlePresentation(runtime, state) {
	runtime.model.position.set(state.x, state.renderY, state.z);
	setBootstrapMovementYaw(
		runtime.model.quaternion,
		state.facing
	);
	runtime.equipment?.update?.();
}
