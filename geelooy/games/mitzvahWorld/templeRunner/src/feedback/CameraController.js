// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraController.js
 * @description Applies eased collision-neutral camera position, FOV, landing impulse, and corner pose from separate target dynamics.
 * The Awtsmoos renews perspective before one frame can feel near, fast, low, or wide;
 * Awtsmoos.com keeps Ayin concerned with camera mutation while Chochmah computes the hidden target inside.
 */

import { CAMERA_CONFIG } from "../config.js";
import { ChochmahCameraPoseDynamics } from "./CameraPoseDynamics.js";

export class AyinCameraController {
	/**
	 * @param {object} nativeScene Core-owned scene wrapper.
	 * @param {object} runner Runner controller.
	 * @param {object} state Runner state.
	 * @param {object} world Temple world.
	 */
	constructor(nativeScene, runner, state, world) {
		this.nativeScene = nativeScene;
		this.camera = nativeScene.camera;
		this.dynamics = new ChochmahCameraPoseDynamics(
			runner,
			state,
			world
		);
		this.landingOffset = 0;
		this.reset();
	}

	/** Restores neutral camera position, FOV, and native rotation. */
	reset() {
		this.landingOffset = 0;
		this.camera.position.set(
			0,
			CAMERA_CONFIG.baseY,
			CAMERA_CONFIG.baseZ
		);
		this.camera.fov = CAMERA_CONFIG.baseFov;
		this.camera.updateProjectionMatrix?.();
		this.nativeScene.setRotation(CAMERA_CONFIG.pitch, 0, 0);
	}

	/** Adds one restrained landing impulse without moving gameplay geometry. */
	land() {
		this.landingOffset = CAMERA_CONFIG.landingImpulse;
	}

	/** @param {number} delta Frame duration in seconds. */
	update(delta) {
		const positionBlend = 1
			- Math.exp(-CAMERA_CONFIG.positionEase * delta);
		const fovBlend = 1
			- Math.exp(-CAMERA_CONFIG.fovEase * delta);
		this.landingOffset *= Math.exp(-10 * delta);
		const target = this.dynamics.positionTarget(
			this.landingOffset
		);
		this.camera.position.x += (
			target.x - this.camera.position.x
		) * positionBlend;
		this.camera.position.y += (
			target.y - this.camera.position.y
		) * positionBlend;
		this.camera.position.z += (
			target.z - this.camera.position.z
		) * positionBlend;
		this.updateFov(target.speedRatio, fovBlend);
		this.updateRotation();
	}

	/** @param {number} speedRatio Normalized speed. @param {number} blend Exponential FOV blend. */
	updateFov(speedRatio, blend) {
		const targetFov = CAMERA_CONFIG.baseFov
			+ speedRatio * (
				CAMERA_CONFIG.maxFov - CAMERA_CONFIG.baseFov
			);
		this.camera.fov += (targetFov - this.camera.fov) * blend;
		this.camera.updateProjectionMatrix?.();
	}

	/** Applies the current lane roll and corner sweep to native camera presentation. */
	updateRotation() {
		const target = this.dynamics.rotationTarget();
		this.nativeScene.setRotation(
			target.pitch,
			target.yaw,
			target.roll
		);
	}

	/** @returns {object} Browser-readable presentation evidence. */
	snapshot() {
		return {
			fov: Number(this.camera.fov.toFixed(2)),
			turnStrength: Number(
				this.dynamics.turnStrength().toFixed(3)
			),
			landingOffset: Number(
				this.landingOffset.toFixed(3)
			)
		};
	}
}
