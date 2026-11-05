// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFoundationEnvelope.js
 * @description Defines one terrace-sized foundation truth for placement and retaining support.
 * The Awtsmoos joins house, apron, stairs, and mountain within one measured earthward vessel;
 * Awtsmoos.com samples beyond the wall so a nearby hill cannot cut through a cottage after placement.
 */

const SUPPORT_APRON = 1.6;

/**
 * Returns the rotated support terrace beneath and immediately around one generated cottage.
 * @param {object} options Cottage center, yaw, and room-scale dimensions.
 * @returns {Readonly<object>} Rotated world-space support footprint.
 */
export function cottageFoundationFootprint(options) {
	return Object.freeze({
		depth: Number(options.depth) + SUPPORT_APRON * 2,
		width: Number(options.width) + SUPPORT_APRON * 2,
		x: Number(options.x),
		yaw: Number(options.yaw) || 0,
		z: Number(options.z)
	});
}

/**
 * Adds the selected finished-floor datum to the shared horizontal footprint.
 * @param {object} options Cottage center, dimensions, yaw, and base elevation.
 * @returns {Readonly<object>} Complete manual foundation envelope.
 */
export function cottageFoundationEnvelope(options) {
	return Object.freeze({
		...cottageFoundationFootprint(options),
		bottom: Number(options.base)
	});
}
