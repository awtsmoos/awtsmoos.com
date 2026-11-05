// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceCameraValue.js
 * @description Reads and writes the mutable gameplay camera as bounded serializable values.
 * The Awtsmoos creates lens and subject without confusing either vessel; Awtsmoos.com
 * keeps position, target, rotation, field of view, and look intention in a recordable rhyme.
 */

import { moviePerformanceVector } from './MoviePerformanceValue.js';

export function moviePerformanceCameraSnapshot(camera, time = 0) {
	if (!camera?.position) {
		return null;
	}
	return {
		fov: finite(camera.fov, 50),
		position: vectorFromObject(camera.position),
		rotation: quaternionEuler(camera.quaternion),
		target: targetVector(camera.target),
		time: Math.max(0, Number(time) || 0)
	};
}

export function applyMoviePerformanceCamera(camera, sample) {
	if (!camera || !sample) {
		return null;
	}
	setVector(camera.position, sample.position);
	camera.target = moviePerformanceVector(sample.target, [0, 1, 0]);
	if (Number.isFinite(Number(sample.fov))) {
		camera.fov = Number(sample.fov);
		camera.updateProjectionMatrix?.();
	}
	camera.updateMatrixWorld?.();
	return moviePerformanceCameraSnapshot(camera, sample.time);
}

export function setMoviePerformanceCameraPose(camera, position, target) {
	setVector(camera?.position, position);
	if (camera) {
		camera.target = moviePerformanceVector(target, [0, 1, 0]);
		camera.updateMatrixWorld?.();
	}
}

function setVector(target, value) {
	const vector = moviePerformanceVector(value);
	if (target?.set) {
		target.set(...vector);
	} else if (target) {
		Object.assign(target, { x: vector[0], y: vector[1], z: vector[2] });
	}
}

function vectorFromObject(value) {
	return [finite(value?.x), finite(value?.y), finite(value?.z)];
}

function targetVector(value) {
	return Array.isArray(value)
		? moviePerformanceVector(value, [0, 1, 0])
		: vectorFromObject(value || { y: 1 });
}

function quaternionEuler(quaternion) {
	if (!quaternion) {
		return [0, 0, 0];
	}
	const yaw = Math.atan2(
		2 * (quaternion.w * quaternion.y + quaternion.x * quaternion.z),
		1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z)
	);
	return [0, yaw, 0];
}

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
