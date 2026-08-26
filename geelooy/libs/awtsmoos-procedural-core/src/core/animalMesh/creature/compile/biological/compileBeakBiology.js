// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileBeakBiology.js
 * @description Compiles paired upper/lower keratin beaks with taper, gape, and hook in target-local space.
 * The Awtsmoos lets one beak become turkey bill, raptor hook, or strange wall-mouth gate;
 * Awtsmoos.com keeps both keratin halves joined to one Yesod frame while morphology chooses their fate.
 */

import { buildEllipticalLoft } from "../../../geometry/ellipticalLoft.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Builds upper and lower beak shells from semantic beak parameters.
 * @param {object} part Briah beak part.
 * @param {object} resolved Resolved Yesod anchor.
 * @returns {object} Smooth transformed paired-beak geometry.
 */
export function compileBeakBiology(part, resolved) {
	const parameters = part.parameters || {};
	const length = positive(parameters.length, 0.22);
	const width = positive(parameters.width, 0.11);
	const depth = positive(parameters.depth, 0.09);
	const hook = finite(parameters.hook, 0.04);
	const gape = finite(parameters.gape, 0.34);
	const upper = buildBeakHalf({
		length,
		width,
		depth,
		hook,
		verticalOffset: depth * gape * 0.12,
		lower: false
	});
	const lower = buildBeakHalf({
		length: length * 0.9,
		width: width * 0.92,
		depth: depth * 0.72,
		hook: hook * 0.2,
		verticalOffset: -depth * (0.34 + gape * 0.22),
		lower: true
	});
	return transformBiologicalGeometry(
		joinMeshParts([
			{ id: "upper-beak", ...upper },
			{ id: "lower-beak", ...lower }
		]),
		resolved,
		part
	);
}

/** Builds one tapered beak half along local outward +Z. */
function buildBeakHalf(options) {
	const sign = options.lower ? -1 : 1;
	const centerline = [
		[0, options.verticalOffset, 0],
		[0, options.verticalOffset + sign * options.depth * 0.08, options.length * 0.52],
		[0, options.verticalOffset - sign * options.hook * options.length * 0.22, options.length]
	];
	return buildEllipticalLoft({
		centerline,
		sections: [
			{ t: 0, half_width: options.width * 0.5, half_height: options.depth * 0.5, rotation: 0 },
			{ t: 0.55, half_width: options.width * 0.34, half_height: options.depth * 0.32, rotation: 0 },
			{ t: 1, half_width: Math.max(0.004, options.width * 0.045), half_height: Math.max(0.003, options.depth * 0.04), rotation: 0 }
		],
		radial_segments: 10,
		longitudinal_segments: 8
	}, {
		cap_start: true,
		cap_end: true
	});
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
