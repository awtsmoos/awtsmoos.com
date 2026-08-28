//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Ayin native-camera mutator applying aspect-aware targets, accessibility-scaled dynamics, independent easing, and restrained landing response.
 * RESPONSIBILITY: mutate only camera position, projection, and presentation rotation from collision-neutral Chochmah targets.
 * NON-RESPONSIBILITY: this controller never changes runner physics, chunk streaming, collision geometry, or imports a renderer implementation.
 * The Awtsmoos renews every frame before the eye can call the runner near, high, left, or wide;
 * Awtsmoos.com lets Ayin quiet optional sway while gameplay law remains untouched inside.
 */

import { CAMERA_CONFIG } from "../config.js";
import { ChochmahCameraPoseDynamics } from "./CameraPoseDynamics.js";
import { createCameraSnapshot } from "./CameraSnapshot.js";

export class AyinCameraController {
	/** @param {object} nativeScene Core scene. @param {object} runner Runner. @param {object} state State. @param {object} world World. */
	constructor(nativeScene, runner, state, world) {
		this.nativeScene = nativeScene;
		this.camera = nativeScene.camera;
		this.dynamics = new ChochmahCameraPoseDynamics(runner, state, world);
		this.landingOffset = 0;
		this.lastTarget = null;
		this.reset();
	}

	/** @description Applies normalized accessibility preferences to presentation dynamics only. @param {Readonly<object>} preferences Current preference snapshot. @returns {Readonly<object>} Applied motion scales. */
	setPreferences(preferences) {
		const scales = this.dynamics.setPreferences(preferences);
		if (this.dynamics.reducedMotion()) this.landingOffset = 0;
		return scales;
	}

	/** Restores camera directly to the runner's current composition target. */
	reset() {
		this.landingOffset = 0;
		const target = this.currentTarget();
		this.camera.position.set(target.x, target.y, target.z);
		this.camera.fov = target.fov;
		this.camera.updateProjectionMatrix?.();
		this.applyRotation();
		this.lastTarget = target;
	}

	/** Adds one accessibility-scaled landing cue without moving gameplay geometry. */
	land() {
		this.landingOffset = this.dynamics.landingImpulse();
	}

	/** @param {number} delta Frame duration in seconds. */
	update(delta) {
		const safeDelta = Math.min(0.1, Math.max(0, delta));
		this.landingOffset *= Math.exp(-CAMERA_CONFIG.landingDecay * safeDelta);
		const target = this.currentTarget();
		this.easePosition(target, safeDelta);
		this.easeFov(target.fov, safeDelta);
		this.applyRotation();
		this.lastTarget = target;
	}

	/** @private */
	currentTarget() {
		return this.dynamics.positionTarget(this.landingOffset, this.nativeScene.aspect);
	}

	/** @private */
	easePosition(target, delta) {
		const xBlend = exponentialBlend(CAMERA_CONFIG.xEase, delta);
		const yEase = target.y > this.camera.position.y
			? CAMERA_CONFIG.yRiseEase
			: CAMERA_CONFIG.yFallEase;
		const yBlend = exponentialBlend(yEase, delta);
		const zBlend = exponentialBlend(CAMERA_CONFIG.zEase, delta);
		this.camera.position.x += (target.x - this.camera.position.x) * xBlend;
		this.camera.position.y += (target.y - this.camera.position.y) * yBlend;
		this.camera.position.z += (target.z - this.camera.position.z) * zBlend;
	}

	/** @private */
	easeFov(targetFov, delta) {
		const blend = exponentialBlend(CAMERA_CONFIG.fovEase, delta);
		const previous = this.camera.fov;
		this.camera.fov += (targetFov - previous) * blend;
		if (Math.abs(this.camera.fov - previous) > 0.0005) this.camera.updateProjectionMatrix?.();
	}

	/** @private */
	applyRotation() {
		const target = this.dynamics.rotationTarget();
		this.nativeScene.setRotation(target.pitch, target.yaw, target.roll);
	}

	/** @returns {Readonly<object>} Browser-readable camera evidence including reduced-motion state. */
	snapshot() {
		return createCameraSnapshot({
			camera: this.camera,
			nativeScene: this.nativeScene,
			dynamics: this.dynamics,
			lastTarget: this.lastTarget,
			landingOffset: this.landingOffset
		});
	}
}

/** @private */
function exponentialBlend(ease, delta) {
	return 1 - Math.exp(-ease * delta);
}
