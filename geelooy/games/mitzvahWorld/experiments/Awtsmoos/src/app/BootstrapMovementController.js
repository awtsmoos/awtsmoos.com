// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Orchestrates actor keys, camera touch, movement mode, world step, and animation state.
 * The Awtsmoos joins many finite intentions into one bounded journey; Awtsmoos.com keeps the
 * controller small while a dedicated runtime vessel guards progressive boot and hydration.
 */

import {
	combineMeadowSteps,
	meadowCameraMovementStep,
	meadowMovementStep,
	meadowTravelFacing,
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

const RUN_SPEED = 7.2;
const TURN_SPEED = 2.35;
const WALK_SPEED = 4.2;

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
		const axis = runtime.input.axis();
		const axes = movementAxes(axis);
		const keyboard = normalizedMeadowIntent(axes.keyboard);
		const joystick = normalizedMeadowIntent(axes.joystick);
		const movementMode = movementModeFor(runtime);
		const turnDelta = keyboard.turn * TURN_SPEED * deltaSeconds;
		state.facing += turnDelta;
		runtime.cameraRig?.followTurn?.(turnDelta);
		state.runMode = movementMode.effectiveMode === 'run';
		const richVertical = prepareMovementVertical(runtime, state, deltaSeconds);
		const speed = state.runMode ? RUN_SPEED : WALK_SPEED;
		const keyboardStep = meadowMovementStep(state.facing, keyboard, speed, deltaSeconds);
		const touchStep = meadowCameraMovementStep(
			runtime.camera,
			joystick,
			speed,
			deltaSeconds,
			state.facing
		);
		const step = combineMeadowSteps(keyboardStep, touchStep);
		applyMovementCollision(runtime, state, step);
		finishMovementVertical(runtime, state, richVertical);
		state.moving = Math.hypot(step.x, step.z) > 0.0001;
		state.travelFacing = meadowTravelFacing(step, state.facing);
		state.action = actionFor(state);
		runtime.model.position.set(state.x, state.renderY, state.z);
		setYaw(runtime.model.quaternion, state.travelFacing);
		const cameraMode = updateMovementCamera(runtime, state, deltaSeconds);
		runtime.multiplayerBridge?.update?.(deltaSeconds, state);
		this.distance += Math.hypot(step.x, step.z);
		this.frames += 1;
		this.lastIntent = { axis, cameraMode, joystick, keyboard, movementMode };
		return state;
	}

	snapshot() {
		const mode = this.lastIntent.movementMode || {};
		return {
			cameraMode: this.lastIntent.cameraMode || 'bootstrap-rig',
			distance: this.distance,
			effectiveMode: mode.effectiveMode || 'walk',
			frames: this.frames,
			intent: this.lastIntent,
			jumpsUsed: this.runtime.state.jumpsUsed,
			position: positionReceipt(this.runtime.state),
			runMode: this.runtime.state.runMode,
			selectedMode: mode.selectedMode || 'walk'
		};
	}
}

function actionFor(state) {
	if (!state.grounded) return state.airPhase;
	if (!state.moving) return 'idle';
	return state.runMode ? 'run' : 'walk';
}

function setYaw(quaternion, yaw) {
	quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

function positionReceipt(state) {
	return { x: state.x, y: state.y, z: state.z };
}
