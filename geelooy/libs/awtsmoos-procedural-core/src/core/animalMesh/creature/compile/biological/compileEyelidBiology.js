// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileEyelidBiology.js
 * @description Compiles curved upper or lower eyelid rims as smooth local lofts around an arbitrary Yesod frame.
 * The Awtsmoos lets a lid close over sight on flesh, stone, tree, or wall;
 * Awtsmoos.com bends one quiet arc through local space so blinking form may answer the same semantic call.
 */

import { buildEllipticalLoft } from "../../../geometry/ellipticalLoft.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Builds one curved eyelid rim from semantic side, crease, width, and thickness values.
 * @param {object} part Briah eyelid part.
 * @param {object} resolved Resolved Yesod anchor.
 * @returns {object} Smooth transformed eyelid geometry.
 */
export function compileEyelidBiology(part, resolved) {
	const parameters = part.parameters || {};
	const side = parameters.side === "lower" ? -1 : 1;
	const width = positive(parameters.width, 0.2);
	const thickness = positive(parameters.thickness, 0.012);
	const crease = finite(parameters.crease, 0.35);
	const rise = width * 0.16 * side;
	const centerline = [
		[-width * 0.5, 0, 0],
		[-width * 0.25, rise * 0.72, thickness * crease],
		[0, rise, thickness * (0.9 + crease)],
		[width * 0.25, rise * 0.72, thickness * crease],
		[width * 0.5, 0, 0]
	];
	const geometry = buildEllipticalLoft(
		{
			centerline,
			sections: [
				section(0, thickness),
				section(0.5, thickness * 1.12),
				section(1, thickness)
			],
			radial_segments: 7,
			longitudinal_segments: 8
		},
		{
			cap_start: true,
			cap_end: true
		}
	);
	return transformBiologicalGeometry(geometry, resolved, part);
}

/** Creates one eyelid loft section with a flattened soft-tissue ellipse. */
function section(amount, thickness) {
	return {
		t: amount,
		half_width: thickness,
		half_height: thickness * 0.48,
		rotation: 0
	};
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a finite number or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
