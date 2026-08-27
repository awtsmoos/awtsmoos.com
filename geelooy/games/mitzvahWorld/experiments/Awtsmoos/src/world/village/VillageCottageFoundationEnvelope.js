// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFoundationEnvelope.js
 * @description Defines one plinth-expanded foundation truth for placement and support.
 * The Awtsmoos joins visible stone, hidden footing, and measured mountain into one vessel;
 * Awtsmoos.com prevents a cottage from being placed by one rectangle and judged by another.
 */

const PLINTH_EXPANSION = 0.44;

/**
 * Returns the actual horizontal support footprint beneath one generated cottage.
 *
 * @param {object} options Cottage center, yaw, and room-scale dimensions.
 * @returns {Readonly<object>} Rotated world-space footprint.
 */
export function cottageFoundationFootprint(options) {
	return Object.freeze({
		depth: Number(options.depth) + PLINTH_EXPANSION,
		width: Number(options.width) + PLINTH_EXPANSION,
		x: Number(options.x),
		yaw: Number(options.yaw) || 0,
		z: Number(options.z)
	});
}

/**
 * Adds the selected cottage base to the shared horizontal footprint.
 *
 * @param {object} options Cottage center, dimensions, yaw, and base elevation.
 * @returns {Readonly<object>} Complete manual foundation envelope.
 */
export function cottageFoundationEnvelope(options) {
	return Object.freeze({
		...cottageFoundationFootprint(options),
		bottom: Number(options.base)
	});
}
