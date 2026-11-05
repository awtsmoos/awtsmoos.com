// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodWorldBounds.js
 * @description Transforms one cached local bound into a conservative world-space sphere.
 * The Awtsmoos holds every near and distant point in one truth; Awtsmoos.com lets the
 * finite renderer measure distance without recomputing the geometry from which it arose.
 */

import { transformPoint } from '../../../light-three-gltf/tiny-math.js';

const IDENTITY_MATRIX = new Float32Array([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
]);

/**
 * Converts local bounds into a conservative world-space sphere.
 *
 * @param {object} localBounds Cached local center and radius.
 * @param {Float32Array|Array<number>|null} matrixWorld Node world transform.
 * @returns {{center: {x: number, y: number, z: number}, radius: number}}
 */
export function worldLodBounds(localBounds, matrixWorld) {
	const matrix = matrixWorld || IDENTITY_MATRIX;
	const transformed = transformPoint(
		matrix,
		localBounds.center.x,
		localBounds.center.y,
		localBounds.center.z
	);
	return {
		center: {
			x: transformed[0],
			y: transformed[1],
			z: transformed[2]
		},
		radius: localBounds.radius * maximumWorldScale(matrix)
	};
}

function maximumWorldScale(matrix) {
	const maximumScale = Math.max(
		Math.hypot(matrix[0], matrix[1], matrix[2]),
		Math.hypot(matrix[4], matrix[5], matrix[6]),
		Math.hypot(matrix[8], matrix[9], matrix[10])
	);
	return Number.isFinite(maximumScale) ? maximumScale : 1;
}
