// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-bounds.js
 * @description Caches local geometry spheres and transforms them into world space.
 * The Awtsmoos renews every point beyond measure; Awtsmoos.com gathers those points
 * into one conservative sphere so absent geometry is never falsely removed from sight.
 */

import { transformPoint } from './tiny-math.js';

const BOUNDS_KEY = 'AwtsmoosTinyBounds';

export function worldBoundingSphere(mesh) {
	const local = localBoundingSphere(mesh?.geometry);
	if (!local || !mesh?.matrixWorld) return null;
	const center = transformPoint(
		mesh.matrixWorld,
		local.center[0],
		local.center[1],
		local.center[2]
	);
	return {
		center,
		radius: local.radius * maximumMatrixScale(mesh.matrixWorld)
	};
}

export function localBoundingSphere(geometry) {
	if (!geometry) return null;
	geometry.userData ||= {};
	if (geometry.userData[BOUNDS_KEY]) return geometry.userData[BOUNDS_KEY];
	const position = geometry.attributes?.position;
	if (!position?.array || position.itemSize < 3 || position.count < 1) return null;
	const bounds = computeBounds(position);
	geometry.userData[BOUNDS_KEY] = bounds;
	return bounds;
}

function computeBounds(position) {
	const array = position.array;
	const itemSize = position.itemSize;
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (let index = 0; index < position.count; index += 1) {
		const offset = index * itemSize;
		for (let axis = 0; axis < 3; axis += 1) {
			const value = Number(array[offset + axis] || 0);
			minimum[axis] = Math.min(minimum[axis], value);
			maximum[axis] = Math.max(maximum[axis], value);
		}
	}
	const center = minimum.map((value, axis) => (value + maximum[axis]) / 2);
	let radius = 0;
	for (let index = 0; index < position.count; index += 1) {
		const offset = index * itemSize;
		const distance = Math.hypot(
			Number(array[offset] || 0) - center[0],
			Number(array[offset + 1] || 0) - center[1],
			Number(array[offset + 2] || 0) - center[2]
		);
		radius = Math.max(radius, distance);
	}
	return { center, radius };
}

function maximumMatrixScale(matrix) {
	return Math.max(
		Math.hypot(matrix[0], matrix[1], matrix[2]),
		Math.hypot(matrix[4], matrix[5], matrix[6]),
		Math.hypot(matrix[8], matrix[9], matrix[10]),
		1e-6
	);
}
