// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-camera-math.js
 * @description Camera projection and world-point revelation for the mountain village.
 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
 */

import { identity } from './tiny-matrix-core.js';

export function perspective(fovDegrees, aspect, near, far) {
	const factor = 1 / Math.tan(fovDegrees * Math.PI / 360);
	const depth = 1 / (near - far);
	const result = new Float32Array(16);
	result[0] = factor / aspect;
	result[5] = factor;
	result[10] = (far + near) * depth;
	result[11] = -1;
	result[14] = 2 * far * near * depth;
	return result;
}

export function lookAt(eye, target, up = [0, 1, 0]) {
	const forward = normalize3([
		eye[0] - target[0],
		eye[1] - target[1],
		eye[2] - target[2]
	]);
	const right = normalize3(cross3(up, forward));
	const upward = cross3(forward, right);
	const result = identity();
	result[0] = right[0];
	result[1] = upward[0];
	result[2] = forward[0];
	result[4] = right[1];
	result[5] = upward[1];
	result[6] = forward[1];
	result[8] = right[2];
	result[9] = upward[2];
	result[10] = forward[2];
	result[12] = -dot3(right, eye);
	result[13] = -dot3(upward, eye);
	result[14] = -dot3(forward, eye);
	return result;
}

export function transformPoint(matrix, x, y, z) {
	return [
		matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
		matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
		matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
	];
}

function cross3(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function dot3(left, right) {
	return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function normalize3(vector) {
	const inverseLength = 1 / (Math.hypot(vector[0], vector[1], vector[2]) || 1);
	return vector.map(value => value * inverseLength);
}
