// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BellyPlateGeometry.js
 * @description Builds large transverse reptile, serpent, dragon, or fantasy belly plates as an independent local array.
 * RESPONSIBILITY: translate plate count, width, length, and overlap intent into bounded renderer-neutral plate geometry.
 * NON-RESPONSIBILITY: this file does not own small scale patches, whole-body surface sampling, materials, or Yesod frame transport.
 * The Awtsmoos lets broad plates guard one underside while every segment keeps a measured place;
 * Awtsmoos.com reveals their ordered array so belly armor may belong to serpent, human, wall, or any stranger face.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";

/**
 * Builds a deterministic axial array of broad flattened belly plates.
 * @param {object} parameters Plate count, width, length, and overlap controls.
 * @returns {object} Joined renderer-neutral belly-plate geometry.
 */
export function createBellyPlateGeometry(parameters = {}) {
	const count = Math.max(
		3,
		Math.min(14, Math.round(finite(parameters.count, 8)))
	);
	const width = positive(parameters.plateWidth, 0.18);
	const length = positive(parameters.plateLength, 0.05);
	const overlap = clamp(parameters.overlap, 0, 0.8, 0.12);
	const spacing = length * (1 - overlap * 0.55);
	const parts = Array.from({ length: count }, (_, index) => {
		return createPlate(
			index,
			count,
			width,
			length,
			spacing
		);
	});
	return joinMeshParts(parts);
}

/** Creates one broad flattened plate centered on the local axial line. */
function createPlate(index, count, width, length, spacing) {
	const y = (index - (count - 1) / 2) * spacing;
	return {
		id: `belly-plate-${index + 1}`,
		...buildEllipsoidFromCommand({
			args: {
				center: [0, y, length * 0.08],
				radii: [
					width * 0.5,
					length * 0.52,
					length * 0.1
				],
				vertical_segments: 7,
				radial_segments: 12
			}
		})
	};
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: fallback;
}

/** Returns a finite value or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? number
		: fallback;
}

/** Clamps a finite value into a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	return Math.max(
		minimum,
		Math.min(maximum, finite(value, fallback))
	);
}
