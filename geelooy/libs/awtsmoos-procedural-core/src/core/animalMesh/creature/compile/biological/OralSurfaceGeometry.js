// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OralSurfaceGeometry.js
 * @description Builds gum and palate surfaces independently from teeth, tongue, lips, or whole-head generation.
 * The Awtsmoos hides soft vessels beneath speech, where gum and palate quietly frame the sound;
 * Awtsmoos.com lets those inner surfaces stand alone so any mouth assembly may remain modular, living, and profound.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";

/**
 * Builds a smooth gum-bed volume capable of receiving standalone teeth or dentition arrays.
 * @param {object} parameters Gum width, depth, and thickness intent.
 * @returns {object} Renderer-neutral gum geometry.
 */
export function createGumGeometry(parameters = {}) {
	const thickness = positive(parameters.thickness, 0.018);
	return createEllipsoid(
		[0, 0, -thickness * 0.5],
		[
			positive(parameters.width, 0.28) * 0.5,
			thickness,
			positive(parameters.depth, 0.09) * 0.5
		]
	);
}

/**
 * Builds a flattened oral-roof volume representing the hard/soft palate body.
 * @param {object} parameters Palate length, width, and soft-drop intent.
 * @returns {object} Renderer-neutral palate geometry.
 */
export function createPalateGeometry(parameters = {}) {
	const softDrop = positive(parameters.softDrop, 0.025);
	return createEllipsoid(
		[0, softDrop * 0.15, 0],
		[
			positive(parameters.width, 0.12) * 0.5,
			softDrop * 0.6,
			positive(parameters.length, 0.16) * 0.5
		]
	);
}

/**
 * Builds one smooth ellipsoid using the library's established primitive generator.
 * @param {Array<number>} center Local-space center.
 * @param {Array<number>} radii Local-space radii.
 * @returns {object} Renderer-neutral ellipsoid geometry.
 */
function createEllipsoid(center, radii) {
	return buildEllipsoidFromCommand({
		args: {
			center,
			radii,
			vertical_segments: 10,
			radial_segments: 14
		}
	});
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
