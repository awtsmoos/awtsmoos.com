//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Ayin native-camera mutator applying aspect-aware targets with independent axis/FOV easing and restrained landing response.
 * RESPONSIBILITY: mutate only camera position, projection, and presentation rotation from collision-neutral Chochmah targets.
 * NON-RESPONSIBILITY: this controller never changes runner physics, chunk streaming, collision geometry, or imports a renderer implementation.
 * OROS/KEILIM: perspective is ohr; independent easing and measured reset are Ayin kelim keeping the runner attached without seasick motion.
 * The Awtsmoos renews every frame before the eye can call the runner near, high, left, or wide;
 * Awtsmoos.com lets Ayin follow the living composition while gameplay law remains untouched inside.
 */

import { CAMERA_CONFIG } from "../config.js";
import { ChochmahCameraPoseDynamics } from "./CameraPoseDynamics.js";

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

	/** Adds one small landing cue without moving gameplay geometry. */
	land() {
		this.landingOffset = CAMERA_CONFIG.landingImpulse;
	}

	/** @param {number} delta Frame duration in seconds. */
	update(delta) {
		const safeDelta = Math.min(0.1, Math.max(0, delta));
		this.landingOffset *= Math.exp(
			-CAMERA_CONFIG.landingDecay * safeDelta
		);
		const target = this.currentTarget();
		this.easePosition(target, safeDelta);
		this.easeFov(target.fov, safeDelta);
		this.applyRotation();
		this.lastTarget = target;
	}

	/** @private */
	currentTarget() {
		return this.dynamics.positionTarget(
			this.landingOffset,
			this.nativeScene.aspect
		);
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
		if (Math.abs(this.camera.fov - previous) > 0.0005) {
			this.camera.updateProjectionMatrix?.();
		}
	}

	/** @private */
	applyRotation() {
		const target = this.dynamics.rotationTarget();
		this.nativeScene.setRotation(target.pitch, target.yaw, target.roll);
	}

	/** @returns {Readonly<object>} Browser-readable camera evidence. */
	snapshot() {
		return Object.freeze({
			fov: rounded(this.camera.fov),
			x: rounded(this.camera.position.x),
			y: rounded(this.camera.position.y),
			z: rounded(this.camera.position.z),
			targetX: rounded(this.lastTarget?.x ?? 0),
			targetY: rounded(this.lastTarget?.y ?? 0),
			targetZ: rounded(this.lastTarget?.z ?? 0),
			aspect: rounded(this.nativeScene.aspect),
			turnStrength: rounded(this.dynamics.turnStrength()),
			landingOffset: rounded(this.landingOffset)
		});
	}
}

/** @private */
function exponentialBlend(ease, delta) {
	return 1 - Math.exp(-ease * delta);
}

/** @private */
function rounded(value) {
	return Number(Number(value ?? 0).toFixed(3));
}
