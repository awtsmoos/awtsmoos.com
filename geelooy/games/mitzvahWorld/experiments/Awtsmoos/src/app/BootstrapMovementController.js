// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Applies walk, run, jump, turning, camera follow, and capsule-octree movement.
 * The Awtsmoos joins intention to bounded place without severing the ground beneath it;
 * Awtsmoos.com carries every finite step through real collision before revealing position.
 */

const GRAVITY = 20;
const JUMP_SPEED = 7.4;
const RUN_SPEED = 7.2;
const TURN_SPEED = 2.35;
const WALK_SPEED = 4.2;

export class BootstrapMovementController {
	constructor(runtime) {
		this.runtime = runtime;
		this.frames = 0;
		this.distance = 0;
		this.lastIntent = { forward: 0, strafe: 0, turn: 0 };
	}

	update(deltaSeconds) {
		const runtime = this.runtime;
		const state = runtime.state;
		const intent = normalizedIntent(runtime.input.axis());
		state.runMode = runtime.input.runRequested();
		updateJump(state, runtime.input.consumeJump(), deltaSeconds);
		state.facing += intent.turn * TURN_SPEED * deltaSeconds;
		const speed = state.runMode ? RUN_SPEED : WALK_SPEED;
		const sin = Math.sin(state.facing);
		const cos = Math.cos(state.facing);
		const step = {
			x: (sin * intent.forward + cos * intent.strafe) * speed * deltaSeconds,
			y: 0,
			z: (cos * intent.forward - sin * intent.strafe) * speed * deltaSeconds
		};
		moveThroughCollision(runtime, state, step);
		state.moving = Math.hypot(intent.forward, intent.strafe) > 0.001;
		runtime.model.position.set(state.x, state.renderY, state.z);
		setYaw(runtime.model.quaternion, state.facing);
		updateCamera(runtime, state);
		runtime.multiplayerBridge?.update(deltaSeconds, state);
		this.frames += 1;
		this.distance += Math.hypot(step.x, step.z);
		this.lastIntent = intent;
		return state;
	}

	snapshot() {
		return {
			distance: this.distance,
			frames: this.frames,
			intent: { ...this.lastIntent },
			position: { x: this.runtime.state.x, y: this.runtime.state.y, z: this.runtime.state.z },
			runMode: this.runtime.state.runMode
		};
	}
}

function updateJump(state, requested, deltaSeconds) {
	if (requested && state.grounded) {
		state.grounded = false;
		state.velY = JUMP_SPEED;
		state.airPhase = 'rising';
	}
	if (state.grounded) {
		state.renderY = 0;
		state.y = 0;
		state.velY = 0;
		state.airPhase = 'ground';
		return;
	}
	state.velY -= GRAVITY * deltaSeconds;
	state.renderY += state.velY * deltaSeconds;
	state.y = state.renderY;
	state.airPhase = state.velY >= 0 ? 'rising' : 'falling';
	if (state.renderY > 0) return;
	state.renderY = 0;
	state.y = 0;
	state.velY = 0;
	state.grounded = true;
	state.airPhase = 'ground';
}

function moveThroughCollision(runtime, state, step) {
	const result = runtime.collisionMover.move(state, step, {
		floorY: 0,
		grounded: state.grounded,
		maxStepHeight: 0.35
	});
	state.contacts = result.normals || [];
}

function normalizedIntent(axis) {
	const forward = -axis.y;
	const strafe = -axis.x;
	const length = Math.hypot(forward, strafe);
	const scale = length > 1 ? 1 / length : 1;
	return { forward: forward * scale, strafe: strafe * scale, turn: clamp(axis.turn) };
}

function clamp(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}

function setYaw(quaternion, yaw) {
	quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

function updateCamera(runtime, state) {
	const sin = Math.sin(state.facing);
	const cos = Math.cos(state.facing);
	runtime.camera.position.set(state.x - sin * 7, state.renderY + 4.2, state.z - cos * 7);
	runtime.camera.target = [state.x, state.renderY + 1.25, state.z];
}
