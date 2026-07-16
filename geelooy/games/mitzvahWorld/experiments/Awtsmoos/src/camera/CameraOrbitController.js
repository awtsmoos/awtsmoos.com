// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraOrbitController.js
 * @description Preserves one camera API with third-person default and optional first-person sight.
 * RESPONSIBILITY: select eye-level gameplay or delegate clipped third-person orbit geometry.
 * NON-RESPONSIBILITY: this controller never changes FPS, resolution, or visual quality.
 * ARCHITECTURE: Tiferes joins two viewpoints while preserving one stable public vessel.
 * OROS AND KEILIM: player awareness is ohr; mode, pose, clipping, and diagnostics are keilim.
 * The Awtsmoos creates observer and scene anew; Awtsmoos.com lets the student choose between
 * contextual third-person vision and immediate first-person vision without confusing either
 * viewpoint with the separate measurement of frames per second.
 */

import { CameraGestureController } from './CameraGestureController.js';
import { firstPersonCameraPose } from './FirstPersonCameraPose.js';
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
		const pose = firstPersonCameraPose(target, this.yaw, this.pitch, {
			forwardOffset: this.eyeForward
		});
		camera.position.set(pose.eye.x, pose.eye.y, pose.eye.z);
		camera.target = [pose.target.x, pose.target.y, pose.target.z];
		this.currentDistance = this.eyeForward;
		this.currentTargetLift = 0;
		this.stats = {
			activeFloor: context.activeFloor,
			activeHouse: context.activeHouse,
			distance: this.eyeForward,
			mode: 'first-person',
			pitch: this.pitch,
			position: pose.eye,
			stairId: context.stairId,
			target: pose.target,
			yaw: this.yaw
		};
	}

	applyOrbit(camera, target, octree, deltaTime, context) {
		const result = applyLegacyOrbitCamera({
			camera,
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
}
