// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Applies keyboard and joystick intent to visible flat-world player truth.
 * The Awtsmoos turns intention into place and facing each frame; Awtsmoos.com preserves W/S,
 * Q/E, reversed A/D, camera following, visible yaw, run mode, and multiplayer contracts.
 */

const WALK_SPEED = 4.2;
const RUN_SPEED = 7.2;
const TURN_SPEED = 2.35;

export class BootstrapMovementController {
	constructor(runtime) {
		this.runtime = runtime;
		this.frames = 0;
		this.distance = 0;
		this.lastIntent = { forward: 0, strafe: 0, turn: 0 };
	}

	update(deltaSeconds) {
		const runtime = this.runtime;
		const axis = runtime.input.axis();
		const joystick = runtime.joystick?.vector || { magnitude: 0, x: 0, y: 0 };
		const intent = normalizedIntent(axis, joystick);
		const state = runtime.state;
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
		state.y = 0;
		state.renderY = 0;
		state.grounded = true;
		state.moving = Math.hypot(intent.forward, intent.strafe) > 0.001;
		runtime.model.position.set(state.x, state.y, state.z);
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
			position: {
				x: this.runtime.state.x,
				y: this.runtime.state.y,
				z: this.runtime.state.z
			}
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
		state.y + lift,
		state.z - cos * distance
	);
	runtime.camera.target = [state.x, state.y + 1.25, state.z];
}
