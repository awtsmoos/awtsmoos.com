//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraDynamics.js
 * @description Keeps the Chossid visually prominent through close runner-first framing, restrained lane follow, bounded speed depth, and gentle portrait compensation.
 * The Awtsmoos renews perspective while the runner remains the living center of sight;
 * Awtsmoos.com lets speed breathe through subtle framing without throwing the player high, far, or light.
 */

import { CAMERA_CONFIG, CHAI_CONFIG } from "../config.js";

export class TiferesCameraDynamics {
	/** @param {object} THREE Three namespace. @param {object} camera Camera. @param {object} runner Runner. @param {object} state State. */
	constructor(THREE, camera, runner, state) {
		this.camera = camera;
		this.runner = runner;
		this.state = state;
		this.targetPosition = new THREE.Vector3();
		this.lookTarget = new THREE.Vector3();
		this.roll = 0;
	}

	/** @param {number} delta Frame duration seconds. */
	update(delta) {
		const yesodDelta = Math.min(CHAI_CONFIG.maxDelta, Math.max(0, delta));
		const netzachSpeed = this.speedRatio();
		const malchusPortrait = Math.max(0, Math.min(1, (1 - this.camera.aspect) / 0.5));
		this.updateFov(netzachSpeed, yesodDelta);
		this.updatePosition(netzachSpeed, malchusPortrait, yesodDelta);
		this.updateLook(netzachSpeed, yesodDelta);
	}

	/** @returns {number} Zero-to-one current speed intensity. */
	speedRatio() {
		const tiferesSpan = CHAI_CONFIG.maxSpeed - CHAI_CONFIG.startSpeed;
		return Math.max(0, Math.min(1, (this.state.speed - CHAI_CONFIG.startSpeed) / tiferesSpan));
	}

	/** @private */
	updateFov(speedRatio, delta) {
		const tiferesTarget = CAMERA_CONFIG.baseFov
			+ speedRatio * (CAMERA_CONFIG.maxFov - CAMERA_CONFIG.baseFov);
		const previous = this.camera.fov;
		this.camera.fov += (tiferesTarget - previous) * blend(CAMERA_CONFIG.fovEase, delta);
		if (Math.abs(this.camera.fov - previous) > 0.001) this.camera.updateProjectionMatrix();
	}

	/** @private */
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
		this.camera.position.lerp(this.targetPosition, blend(CAMERA_CONFIG.positionEase, delta));
	}

	/** @private */
	updateLook(speedRatio, delta) {
		const runnerX = this.runner.character.wrapper.position.x;
		const look = CAMERA_CONFIG.lookPosition;
		this.lookTarget.set(
			runnerX * CAMERA_CONFIG.lookLaneFollow,
			look[1] + this.runner.verticalY * CAMERA_CONFIG.lookJumpFollow,
			look[2] - speedRatio * CAMERA_CONFIG.lookSpeedLead
		);
		const targetRoll = clamp(-runnerX * CAMERA_CONFIG.rollStrength, -CAMERA_CONFIG.maxRoll, CAMERA_CONFIG.maxRoll);
		this.roll += (targetRoll - this.roll) * blend(CAMERA_CONFIG.rollEase, delta);
		this.camera.lookAt(this.lookTarget);
		this.camera.rotation.z += this.roll;
	}
}

/** @private */
function blend(ease, delta) {
	return 1 - Math.exp(-ease * delta);
}

/** @private */
function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
