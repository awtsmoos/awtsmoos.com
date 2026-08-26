// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileMouthBiology.js
 * @description Compiles lips and recessed oral cavity, with an optional built-in tongue for backwards compatibility.
 * RESPONSIBILITY: create the outer mouth vessel and its immediate cavity; richer dental/tongue assemblies may compose beside it.
 * NON-RESPONSIBILITY: this file does not own gums, dentition, palate, speech solvers, or standalone tongue articulation.
 * The Awtsmoos lets speech open in flesh or stone while inner vessels remain free to join;
 * Awtsmoos.com keeps legacy tongue-light present by default, yet lets a deeper oral assembly reveal each organ by design.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Builds a visibly open mouth with separate lips, cavity, and optionally one simple tongue volume.
 * @param {object} part Briah mouth part carrying width, height, depth, gape, and includeTongue.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Smooth transformed mouth geometry.
 */
export function compileMouthBiology(part, resolved) {
	const parameters = part.parameters || {};
	const dimensions = mouthDimensions(parameters);
	const subparts = createMouthSubparts(dimensions);
	if (parameters.includeTongue !== false) {
		subparts.push(createTongueSubpart(dimensions));
	}
	return transformBiologicalGeometry(
		joinMeshParts(subparts),
		resolved,
		part
	);
}

/** Creates finite mouth dimensions while preserving historical defaults. */
function mouthDimensions(parameters) {
	const width = positive(parameters.width, 0.3);
	const height = positive(parameters.height, 0.1);
	const depth = positive(parameters.depth, 0.18);
	const gape = clamp(parameters.gape, 0, 1, 0.36);
	return Object.freeze({
		depth,
		gape,
		height,
		lipOffset: height * (0.42 + gape * 0.2),
		width
	});
}

/** Builds lips and recessed oral cavity without assuming a tongue implementation. */
function createMouthSubparts(dimensions) {
	return [
		{
			id: "upper-lip",
			...ellipsoid(
				[0, dimensions.lipOffset, dimensions.depth * 0.12],
				[dimensions.width * 0.5, dimensions.height * 0.16, dimensions.depth * 0.12],
				12
			)
		},
		{
			id: "lower-lip",
			...ellipsoid(
				[0, -dimensions.lipOffset, dimensions.depth * 0.1],
				[dimensions.width * 0.5, dimensions.height * 0.18, dimensions.depth * 0.13],
				12
			)
		},
		{
			id: "oral-cavity",
			...ellipsoid(
				[0, 0, -dimensions.depth * 0.18],
				[dimensions.width * 0.42, dimensions.height * (0.3 + dimensions.gape * 0.3), dimensions.depth * 0.32],
				14
			)
		}
	];
}

/** Builds the historical simple tongue volume when no standalone tongue assembly is supplied. */
function createTongueSubpart(dimensions) {
	return {
		id: "tongue",
		...ellipsoid(
			[0, -dimensions.height * 0.16, dimensions.depth * 0.02],
			[dimensions.width * 0.29, dimensions.height * 0.18, dimensions.depth * 0.2],
			10
		)
	};
}

/** Builds one smooth ellipsoid sub-surface with bounded segment counts. */
function ellipsoid(center, radii, segments) {
	return buildEllipsoidFromCommand({
		args: {
			center,
			radii,
			vertical_segments: segments,
			radial_segments: Math.max(12, segments + 4)
		}
	});
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Clamps finite values while preserving a meaningful fallback. */
function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	const finite = Number.isFinite(number) ? number : fallback;
	return Math.max(minimum, Math.min(maximum, finite));
}
