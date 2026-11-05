// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraOrbitController.js
 * @description Preserves one camera API with responsive orbit, first-person sight, and disposal.
 * The Awtsmoos creates observer and scene anew; Awtsmoos.com follows the traveler every frame
 * while cached collision truth and complete listener release keep the finite vessel clean.
 */

import { CameraClipCache } from './CameraClipCache.js';
import { applyFirstPersonCamera } from './CameraFirstPersonRuntime.js';
import { CameraGestureController } from './CameraGestureController.js';
import { applyLegacyOrbitCamera } from './LegacyOrbitCameraPose.js';
import { resolveCameraContext } from './CameraProfileSystem.js';

export class CameraOrbitController {
	constructor(canvas, options = {}) {
		this.canvas = canvas;
		this.mode = options.mode || 'orbit';
		this.distance = options.distance ?? 7;
		this.eyeForward = options.eyeForward ?? 0.24;
		this.pitch = options.pitch ?? 0.34;
		this.yaw = options.yaw ?? Math.PI;
		this.min = options.min ?? 1.35;
		this.max = options.max ?? 48;
		this.currentDistance = this.distance;
		this.currentTargetLift = 0;
		this.spatial = { state: null, houses: [], stairs: [] };
		this.stats = { mode: this.mode };
		this.clipCache = new CameraClipCache(options.clipCache);
		this.gestures = new CameraGestureController(canvas, this);
	}

	setSpatialContext(context = {}) {
		this.spatial = { ...this.spatial, ...context };
		return this;
	}

	setMode(mode) {
		if (!['firstPerson', 'orbit'].includes(mode)) {
			throw new Error(`Unknown camera mode: ${mode}`);
		}
		if (mode === 'orbit' && this.isFirstPerson()) {
			this.currentDistance = Math.max(this.min, this.eyeForward);
		}
		this.mode = mode;
		this.clipCache.clear();
		return this;
	}

	isFirstPerson() {
		return this.mode === 'firstPerson';
	}

	forward() {
		return { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
	}

	right() {
		return { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };
	}

	apply(camera, target, octree, deltaTime = 1 / 60) {
		const context = resolveCameraContext(
			this.spatial.state || target,
			this.spatial.houses,
			this.spatial.stairs
		);
		if (this.isFirstPerson()) {
			this.applyFirstPerson(camera, target, context);
			return;
		}
		this.applyOrbit(camera, target, octree, deltaTime, context);
	}

	applyFirstPerson(camera, target, context) {
		const result = applyFirstPersonCamera({
			camera,
			context,
			forwardOffset: this.eyeForward,
			pitch: this.pitch,
			target,
			yaw: this.yaw
		});
		this.currentDistance = result.currentDistance;
		this.currentTargetLift = result.currentTargetLift;
		this.stats = result.stats;
	}

	applyOrbit(camera, target, octree, deltaTime, context) {
		const result = applyLegacyOrbitCamera({
			camera,
			clipCache: this.clipCache,
			context,
			currentDistance: this.currentDistance,
			currentTargetLift: this.currentTargetLift,
			deltaTime,
			distance: this.distance,
			octree,
			pitch: this.pitch,
			target,
			yaw: this.yaw
		});
		this.currentDistance = result.currentDistance;
		this.currentTargetLift = result.currentTargetLift;
		this.stats = { ...result.stats, mode: 'third-person' };
	}

	destroy() {
		this.gestures.destroy();
		this.clipCache.clear();
	}
}
