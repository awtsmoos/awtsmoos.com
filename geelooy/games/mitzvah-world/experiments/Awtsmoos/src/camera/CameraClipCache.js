// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraClipCache.js
 * @description Reuses a recent obstruction distance while the camera continues following motion.
 * The Awtsmoos renews observer and obstacle without needless repetition; Awtsmoos.com preserves
 * responsive camera movement while expensive collision truth is refreshed on a bounded cadence.
 */

import { clipCameraEye } from './CameraClipSystem.js';

const DEFAULT_REUSE_FRAMES = 2;
const TARGET_REFRESH_DISTANCE = 0.72;
const DESIRED_REFRESH_DISTANCE = 1.05;
const DIRECTION_REFRESH_RADIANS = 0.085;

export class CameraClipCache {
	constructor(options = {}) {
		this.maximumReuseFrames = options.maximumReuseFrames ?? DEFAULT_REUSE_FRAMES;
		this.entry = null;
		this.stats = { hits: 0, misses: 0, revisionInvalidations: 0 };
	}

	resolve(target, desired, octree, minimumSafe) {
		if (this.shouldRefresh(target, desired, octree)) {
			return this.refresh(target, desired, octree, minimumSafe);
		}
		this.entry.reusedFrames += 1;
		this.stats.hits += 1;
		return {
			cached: true,
			eye: eyeAtDistance(target, desired, this.entry.safeDistance),
			hit: this.entry.hit
		};
	}

	clear() {
		this.entry = null;
	}

	diagnostics() {
		return Object.freeze({
			...this.stats,
			maximumReuseFrames: this.maximumReuseFrames,
			reusedFrames: this.entry?.reusedFrames || 0
		});
	}

	shouldRefresh(target, desired, octree) {
		if (!this.entry) return true;
		if (this.entry.octree !== octree) return true;
		if (this.entry.revision !== collisionRevisionFor(octree)) {
			this.stats.revisionInvalidations += 1;
			return true;
		}
		if (this.entry.reusedFrames >= this.maximumReuseFrames) return true;
		if (distance(target, this.entry.target) > TARGET_REFRESH_DISTANCE) return true;
		if (distance(desired, this.entry.desired) > DESIRED_REFRESH_DISTANCE) return true;
		return directionAngle(target, desired, this.entry.target, this.entry.desired)
			> DIRECTION_REFRESH_RADIANS;
	}

	refresh(target, desired, octree, minimumSafe) {
		const resolved = clipCameraEye(target, desired, octree, minimumSafe);
		this.entry = {
			desired: copyPoint(desired),
			hit: resolved.hit,
			octree,
			reusedFrames: 0,
			revision: collisionRevisionFor(octree),
			safeDistance: distance(target, resolved.eye),
			target: copyPoint(target)
		};
		this.stats.misses += 1;
		return { ...resolved, cached: false };
	}
}

function eyeAtDistance(target, desired, safeDistance) {
	const direction = subtract(desired, target);
	const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
	const distanceValue = Math.min(length, safeDistance);
	return {
		x: target.x + direction.x / length * distanceValue,
		y: target.y + direction.y / length * distanceValue,
		z: target.z + direction.z / length * distanceValue
	};
}

function directionAngle(firstTarget, firstEye, secondTarget, secondEye) {
	const first = normalized(subtract(firstEye, firstTarget));
	const second = normalized(subtract(secondEye, secondTarget));
	const dot = Math.max(-1, Math.min(1, first.x * second.x + first.y * second.y + first.z * second.z));
	return Math.acos(dot);
}

function collisionRevisionFor(octree) {
	return octree?.revision === undefined ? 'revision:none' : String(octree.revision);
}

function distance(first, second) {
	return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
}

function normalized(point) {
	const length = Math.hypot(point.x, point.y, point.z) || 1;
	return { x: point.x / length, y: point.y / length, z: point.z / length };
}

function subtract(first, second) {
	return { x: first.x - second.x, y: first.y - second.y, z: first.z - second.z };
}

function copyPoint(point) {
	return { x: point.x, y: point.y, z: point.z };
}
