// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Applies walk, run, jump, strafe, turning, camera, and multiplayer truth each frame.
 * The Awtsmoos raises the traveler and expands the stride without severing grounded direction;
 * Awtsmoos.com preserves W/S, Q/E, reversed A/D, Space, Shift, visible yaw, and shared snapshots.
 */

import { BootstrapJumpController } from './BootstrapJumpController.js?v=20260723-visible-03';
import { bootstrapRunRequested } from './BootstrapRunIntent.js?v=20260723-visible-03';

const WALK_SPEED = 4.2;
const RUN_SPEED = 7.2;
const TURN_SPEED = 2.35;

export class BootstrapMovementController {
	constructor(runtime) {
		this.runtime = runtime;
		this.frames = 0;
		this.distance = 0;
		this.jump = new BootstrapJumpController();
		this.lastIntent = { forward: 0, strafe: 0, turn: 0 };
	}

	update(deltaSeconds) {
		const runtime = this.runtime;
		const axis = runtime.input.axis();
		const joystick = runtime.joystick?.vector || { magnitude: 0, x: 0, y: 0 };
		const intent = normalizedIntent(axis, joystick);
		const state = runtime.state;
		state.runMode = bootstrapRunRequested(runtime.input);
		this.jump.update(
			state,
			deltaSeconds,
			runtime.jumpButton?.consume?.() || false
		);
		state.facing += intent.turn * TURN_SPEED * deltaSeconds;
		const speed = state.runMode ? RUN_SPEED : WALK_SPEED;
		const sin = Math.sin(state.facing);
		const cos = Math.cos(state.facing);
		const velocityX = sin * intent.forward + cos * intent.strafe;
		const velocityZ = cos * intent.forward - sin * intent.strafe;
		const stepX = velocityX * speed * deltaSeconds;
		const stepZ = velocityZ * speed * deltaSeconds;
		state.x += stepX;
		state.z += stepZ;
		state.moving = Math.hypot(intent.forward, intent.strafe) > 0.001;
		runtime.model.position.set(state.x, state.renderY, state.z);
		setYaw(runtime.model.quaternion, state.facing);
		updateCamera(runtime, state);
		runtime.multiplayerBridge?.update(deltaSeconds, state);
		this.frames += 1;
		this.distance += Math.hypot(stepX, stepZ);
		this.lastIntent = intent;
		return state;
	}

	snapshot() {
		return {
			distance: this.distance,
			frames: this.frames,
			intent: { ...this.lastIntent },
			jump: this.jump.snapshot(),
			position: {
				x: this.runtime.state.x,
				y: this.runtime.state.y,
				z: this.runtime.state.z
			},
			runMode: this.runtime.state.runMode
		};
	}
}

function normalizedIntent(axis, joystick) {
	const forward = -(axis.y + joystick.y * joystick.magnitude);
	const strafe = -(axis.x + joystick.x * joystick.magnitude);
	const length = Math.hypot(forward, strafe);
	const scale = length > 1 ? 1 / length : 1;
	return {
		forward: forward * scale,
		strafe: strafe * scale,
		turn: Math.max(-1, Math.min(1, axis.turn))
	};
}

function setYaw(quaternion, yaw) {
	quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

function updateCamera(runtime, state) {
	const distance = 7;
	const lift = 4.2;
	const sin = Math.sin(state.facing);
	const cos = Math.cos(state.facing);
	runtime.camera.position.set(
		state.x - sin * distance,
		state.renderY + lift,
		state.z - cos * distance
	);
	runtime.camera.target = [state.x, state.renderY + 1.25, state.z];
}
