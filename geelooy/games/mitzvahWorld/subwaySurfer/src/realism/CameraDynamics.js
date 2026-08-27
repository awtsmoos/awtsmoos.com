// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews perspective while lane and leap become felt without moving truth;
 * Awtsmoos.com lets the camera breathe with speed while collision stays fixed beneath the youth.
 */

import { CAMERA_CONFIG, CHAI_CONFIG } from "../config.js";

export class TiferesCameraDynamics {
	/** @param {object} THREE Three.js namespace. @param {object} camera Camera. @param {object} runner Runner controller. @param {object} state Runner state. */
	constructor(THREE, camera, runner, state) {
		this.THREE = THREE;
		this.camera = camera;
		this.runner = runner;
		this.state = state;
		this.targetPosition = new THREE.Vector3();
		this.lookTarget = new THREE.Vector3();
	}

	/**
	 * Smoothly follows lane, jump, and speed without touching runner collision coordinates.
	 * @param {number} delta Frame duration in seconds.
	 */
	update(delta) {
		const speedSpan = CHAI_CONFIG.maxSpeed - CHAI_CONFIG.startSpeed;
		const speedRatio = Math.max(0, Math.min(1, (this.state.speed - CHAI_CONFIG.startSpeed) / speedSpan));
		const desiredFov = CAMERA_CONFIG.baseFov + speedRatio * (CAMERA_CONFIG.maxFov - CAMERA_CONFIG.baseFov);
		const fovBlend = 1 - Math.exp(-CAMERA_CONFIG.fovEase * delta);
		this.camera.fov += (desiredFov - this.camera.fov) * fovBlend;
		this.camera.updateProjectionMatrix();

		const runnerX = this.runner.character.wrapper.position.x;
		const jumpY = this.runner.verticalY;
		const base = CAMERA_CONFIG.basePosition;
		this.targetPosition.set(
			runnerX * CAMERA_CONFIG.laneFollow,
			base[1] + jumpY * CAMERA_CONFIG.jumpFollow,
			base[2] + speedRatio * 0.48
		);
		const positionBlend = 1 - Math.exp(-CAMERA_CONFIG.positionEase * delta);
		this.camera.position.lerp(this.targetPosition, positionBlend);
		const look = CAMERA_CONFIG.lookPosition;
		this.lookTarget.set(runnerX * 0.18, look[1] + jumpY * 0.04, look[2] - speedRatio * 1.45);
		this.camera.lookAt(this.lookTarget);
	}
}
