//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraDynamics.js
 * @description Adds bounded speed, portrait, lane, jump, look-ahead, and roll cues without touching Peruta Run collision coordinates.
 * The Awtsmoos renews perspective while lane and leap become felt without moving truth;
 * Awtsmoos.com lets camera depth breathe with speed while gameplay remains fixed beneath the youth.
 */

import { CAMERA_CONFIG, CHAI_CONFIG } from "../config.js";

export class TiferesCameraDynamics {
	/** @param {object} THREE Three.js namespace. @param {object} camera Camera. @param {object} runner Runner controller. @param {object} state Runner state. */
	constructor(THREE, camera, runner, state) {
		this.camera = camera;
		this.runner = runner;
		this.state = state;
		this.targetPosition = new THREE.Vector3();
		this.lookTarget = new THREE.Vector3();
		this.roll = 0;
	}

	/** @param {number} delta Frame duration in seconds. */
	update(delta) {
		const safeDelta = Math.min(CHAI_CONFIG.maxDelta, Math.max(0, delta));
		const speedRatio = this.speedRatio();
		const portrait = Math.max(0, Math.min(1, (1 - this.camera.aspect) / 0.42));
		this.updateFov(speedRatio, safeDelta);
		this.updatePosition(speedRatio, portrait, safeDelta);
		this.updateLook(speedRatio, safeDelta);
	}

	/** @returns {number} Zero-to-one normalized speed intensity. */
	speedRatio() {
		const span = CHAI_CONFIG.maxSpeed - CHAI_CONFIG.startSpeed;
		return Math.max(0, Math.min(1, (this.state.speed - CHAI_CONFIG.startSpeed) / span));
	}

	/** @param {number} speedRatio Speed intensity. @param {number} delta Frame seconds. */
	updateFov(speedRatio, delta) {
		const desired = CAMERA_CONFIG.baseFov
			+ speedRatio * (CAMERA_CONFIG.maxFov - CAMERA_CONFIG.baseFov);
		const previous = this.camera.fov;
		this.camera.fov += (desired - previous) * exponentialBlend(CAMERA_CONFIG.fovEase, delta);
		if (Math.abs(this.camera.fov - previous) > 0.0005) this.camera.updateProjectionMatrix();
	}

	/** @param {number} speedRatio Speed intensity. @param {number} portrait Portrait factor. @param {number} delta Frame seconds. */
	updatePosition(speedRatio, portrait, delta) {
		const runnerX = this.runner.character.wrapper.position.x;
		const jumpY = this.runner.verticalY;
		const base = CAMERA_CONFIG.basePosition;
		const laneFollow = CAMERA_CONFIG.laneFollow + portrait * CAMERA_CONFIG.portraitLaneBoost;
		this.targetPosition.set(
			runnerX * laneFollow,
			base[1] + jumpY * CAMERA_CONFIG.jumpFollow + speedRatio * CAMERA_CONFIG.speedLift,
			base[2] + speedRatio * CAMERA_CONFIG.speedDolly + portrait * CAMERA_CONFIG.portraitPullback
		);
		this.camera.position.lerp(this.targetPosition, exponentialBlend(CAMERA_CONFIG.positionEase, delta));
	}

	/** @param {number} speedRatio Speed intensity. @param {number} delta Frame seconds. */
	updateLook(speedRatio, delta) {
		const runnerX = this.runner.character.wrapper.position.x;
		const jumpY = this.runner.verticalY;
		const look = CAMERA_CONFIG.lookPosition;
		this.lookTarget.set(
			runnerX * CAMERA_CONFIG.lookLaneFollow,
			look[1] + jumpY * CAMERA_CONFIG.lookJumpFollow,
			look[2] - speedRatio * CAMERA_CONFIG.lookSpeedLead
		);
		const desiredRoll = Math.max(
			-CAMERA_CONFIG.maxRoll,
			Math.min(CAMERA_CONFIG.maxRoll, -runnerX * CAMERA_CONFIG.rollStrength)
		);
		this.roll += (desiredRoll - this.roll) * exponentialBlend(CAMERA_CONFIG.rollEase, delta);
		this.camera.lookAt(this.lookTarget);
		this.camera.rotation.z += this.roll;
	}
}

/** @private */
function exponentialBlend(ease, delta) {
	return 1 - Math.exp(-ease * delta);
}
