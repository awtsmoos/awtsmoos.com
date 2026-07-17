// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFarmGeometry.js
 * @description Shares measured farm transforms between crop and orchard builders.
 * The Awtsmoos turns local rows into world-space vessels; Awtsmoos.com keeps every rotation,
 * elevation, and box transform explicit so agricultural detail remains deterministic.
 */

/**
 * Rotates one local farm point into world space.
 *
 * @param {object} footprint Canonical farm footprint.
 * @param {number} localX Local horizontal offset.
 * @param {number} localZ Local depth offset.
 * @returns {{x: number, z: number}} World-space point.
 */
export function rotatedFarmPoint(footprint, localX, localZ) {
	const cosine = Math.cos(footprint.yaw);
	const sine = Math.sin(footprint.yaw);
	return {
		x: footprint.x + localX * cosine - localZ * sine,
		z: footprint.z + localX * sine + localZ * cosine
	};
}

/**
 * Creates one batched farm box transform.
 *
 * @param {number} x World x coordinate.
 * @param {number} y World y coordinate.
 * @param {number} z World z coordinate.
 * @param {number} width Box width.
 * @param {number} height Box height.
 * @param {number} depth Box depth.
 * @param {number} yaw World yaw.
 * @returns {object} Batch-compatible box transform.
 */
export function createFarmBox(x, y, z, width, height, depth, yaw) {
	return {
		position: {
			x,
			y,
			z
		},
		size: {
			x: width,
			y: height,
			z: depth
		},
		yaw
	};
}

/**
 * Creates shared farm batch material options.
 *
 * @param {object} options District construction options.
 * @param {string} color Batch color.
 * @param {string} part Semantic part name.
 * @param {string} textureUrl Physical texture URL.
 * @returns {object} Village box batch options.
 */
export function farmBatchOptions(options, color, part, textureUrl) {
	return {
		color,
		family: 'canonical-farm-terrace',
		part,
		texturePolicy: options.materials.texturePolicy,
		textureUrl
	};
}
