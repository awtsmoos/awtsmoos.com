// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Orchestrates mouse chords, strafing, collision, Kavanah pace, camera, and facing.
 * The Awtsmoos joins key, hand, camera, intention, and traveler without erasing distinction;
 * Awtsmoos.com preserves facing during strafing and lets deliberate movement carry its earned weight.
 */

import {
	bootstrapMovementSpeed,
	bootstrapTravelFacingLocked
} from './BootstrapMovementPace.js';
import {
	bootstrapMovementAction,
	bootstrapMovementSnapshot,
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

export class BootstrapMovementController {
	constructor(runtime) {
		this.runtime = runtime;
		this.distance = 0;
		this.frames = 0;
		this.lastIntent = {};
	}

	update(deltaSeconds) {
		const runtime = this.runtime;
		const state = runtime.state;
		runtime.cameraRig?.synchronizeFacing?.(state);
		const axis = runtime.input.axis();
		const axes = movementAxes(axis);
		const keyboard = normalizedMeadowIntent(axes.keyboard);
		const joystick = normalizedMeadowIntent(axes.joystick);
		const mouse = normalizedMeadowIntent(
			runtime.cameraRig?.mouseMovementAxis?.()
		);
		const movementMode = movementModeFor(runtime);
		const turnDelta = keyboard.turn * TURN_SPEED * deltaSeconds;
		state.facing += turnDelta;
		runtime.cameraRig?.followTurn?.(turnDelta);
		state.runMode = movementMode.effectiveMode === 'run';
		const richVertical = prepareMovementVertical(
			runtime,
			state,
			deltaSeconds
		);
		const speed = bootstrapMovementSpeed(runtime, movementMode);
		const step = combineMeadowSteps(
			meadowMovementStep(
				state.facing,
				keyboard,
				speed,
				deltaSeconds
			),
			meadowCameraMovementStep(
				runtime.camera,
				joystick,
				speed,
				deltaSeconds,
				state.facing
			),
			meadowCameraMovementStep(
				runtime.camera,
				mouse,
				speed,
				deltaSeconds,
				state.facing
			)
		);
		applyMovementCollision(runtime, state, step);
		finishMovementVertical(runtime, state, richVertical);
		state.moving = isMinimalMeadowMovementStep(step);
		state.travelFacing = bootstrapTravelFacingLocked(runtime, keyboard)
			? state.facing
			: retainedMinimalMeadowTravelFacing(
				step,
				state.travelFacing,
				state.facing
			);
		state.action = bootstrapMovementAction(state);
		runtime.model.position.set(state.x, state.renderY, state.z);
		setBootstrapMovementYaw(
			runtime.model.quaternion,
			state.travelFacing
		);
		runtime.equipment?.update?.();
		const cameraMode = updateMovementCamera(
			runtime,
			state,
			deltaSeconds
		);
		runtime.multiplayerBridge?.update?.(deltaSeconds, state);
		this.distance += Math.hypot(step.x, step.z);
		this.frames += 1;
		this.lastIntent = {
			axis,
			cameraMode,
			joystick,
			keyboard,
			mouse,
			movementMode
		};
		return state;
	}

	snapshot() {
		return bootstrapMovementSnapshot(this);
	}
}
