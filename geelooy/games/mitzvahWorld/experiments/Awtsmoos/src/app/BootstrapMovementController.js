// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Applies actor keys, camera touch, run, double jump, hills, and collision.
 * The Awtsmoos joins intention to real earth; Awtsmoos.com preserves historic keyboard law
 * while mobile forward follows sight and two bounded jumps return only after actual landing.
 */

import {
	combineMeadowSteps,
	meadowCameraMovementStep,
	meadowMovementStep,
	meadowTravelFacing,
	normalizedMeadowIntent
} from './MinimalMeadowControlMath.js?v=20260724-meadow-13';
import {
	finishMinimalMeadowVertical,
	prepareMinimalMeadowVertical
} from './MinimalMeadowJumpState.js?v=20260724-meadow-13';

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
		const keyboard = normalizedMeadowIntent(axis);
		const joystick = normalizedMeadowIntent({
			forward: axis.joystickForward,
			strafe: axis.joystickStrafe
		});
		const turnDelta = keyboard.turn * TURN_SPEED * deltaSeconds;
		state.facing += turnDelta;
		runtime.cameraRig.followTurn(turnDelta);
		state.runMode = Boolean(runtime.runToggle || runtime.input.runRequested());
		prepareMinimalMeadowVertical(runtime, state, deltaSeconds);
		const speed = state.runMode ? RUN_SPEED : WALK_SPEED;
		const keyStep = meadowMovementStep(state.facing, keyboard, speed, deltaSeconds);
		const touchStep = meadowCameraMovementStep(runtime.camera, joystick, speed, deltaSeconds, state.facing);
		const step = combineMeadowSteps(keyStep, touchStep);
		moveThroughCollision(runtime, state, step);
		finishMinimalMeadowVertical(runtime, state);
		state.moving = Math.hypot(step.x, step.z) > 0.0001;
		state.travelFacing = meadowTravelFacing(step, state.facing);
		state.action = actionFor(state);
		runtime.model.position.set(state.x, state.renderY, state.z);
		setYaw(runtime.model.quaternion, state.travelFacing);
		runtime.cameraRig.update(runtime.camera, state, runtime.mainOctree, deltaSeconds);
		runtime.multiplayerBridge?.update(deltaSeconds, state);
		this.distance += Math.hypot(step.x, step.z);
		this.frames += 1;
		this.lastIntent = { axis, joystick, keyboard };
		return state;
	}

	snapshot() {
		return {
			distance: this.distance,
			frames: this.frames,
			intent: this.lastIntent,
			jumpsUsed: this.runtime.state.jumpsUsed,
			position: positionReceipt(this.runtime.state),
			runMode: this.runtime.state.runMode
		};
	}
}

function moveThroughCollision(runtime, state, step) {
	const result = runtime.collisionMover.move(state, step, {
		blockSteepFloors: false,
		floorY: runtime.terrain.heightAt(state.x, state.z),
		grounded: state.grounded,
		maxStepHeight: 0.42,
		maxSlopeNormal: 0.58
	});
	state.contacts = result.normals || [];
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
