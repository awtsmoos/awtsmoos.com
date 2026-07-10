// B"H
import { CameraGestureController } from './CameraGestureController.js';
import {
	buildCameraStats,
	clipCameraEye,
	desiredCameraEye
} from './CameraClipSystem.js';
import { resolveCameraContext } from './CameraProfileSystem.js';

/** Coordinates orbit geometry, spatial profiles, gestures, and clipping. */
export class CameraOrbitController {
	constructor(canvas, options = {}) {
		this.canvas = canvas;
		this.distance = options.distance ?? 7;
		this.pitch = options.pitch ?? 0.36;
		this.yaw = options.yaw ?? Math.PI;
		this.min = options.min ?? 1.35;
		this.max = options.max ?? 48;
		this.currentDistance = this.distance;
		this.currentTargetLift = 0;
		this.spatial = { state: null, houses: [], stairs: [] };
		this.stats = { mode: 'outdoor' };
		this.gestures = new CameraGestureController(canvas, this);
	}

	setSpatialContext(context = {}) {
		this.spatial = { ...this.spatial, ...context };
		return this;
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
		const blend = Math.min(1, deltaTime * 7);
		const targetDistance = Math.min(this.distance, context.profile.maxDistance);
		this.currentDistance += (targetDistance - this.currentDistance) * blend;
		this.currentTargetLift += (context.profile.targetLift - this.currentTargetLift) * blend;
		const adjustedTarget = {
			...target,
			y: target.y + this.currentTargetLift
		};
		const pitch = clamp(this.pitch + context.profile.pitchBias, -1.35, 1.42);
		const desired = desiredCameraEye(adjustedTarget, this.yaw, pitch, this.currentDistance);
		const clipped = clipCameraEye(
			adjustedTarget,
			desired,
			octree,
			context.profile.minSafe
		);
		camera.position.set(clipped.eye.x, clipped.eye.y, clipped.eye.z);
		camera.target = [adjustedTarget.x, adjustedTarget.y, adjustedTarget.z];
		this.stats = buildCameraStats(context, adjustedTarget, clipped, this.currentDistance);
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
