// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AquaticGillGeometry.js
 * @description Builds repeated internal slit or external-frond gill geometry without owning a complete fish.
 * RESPONSIBILITY: translate gill count, length, opening, and frond-density intent into bounded renderer-neutral tube structures.
 * NON-RESPONSIBILITY: this file does not place gills, simulate respiration, or generate fish bodies and scales.
 * The Awtsmoos lets breath through water unfold in many soft gates while the Source remains one;
 * Awtsmoos.com gives every slit and frond a measured vessel so aquatic respiration may appear wherever life is spun.
 */

import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";

/**
 * Builds repeated gill slits or external fronds from one semantic profile.
 * @param {object} parameters Gill count, length, opening, and frond-density controls.
 * @returns {object} Joined renderer-neutral gill geometry.
 */
export function createAquaticGillGeometry(parameters = {}) {
	const count = Math.max(
		1,
		Math.min(7, Math.round(finite(parameters.count, 1)))
	);
	const length = positive(parameters.length, 0.18);
	const opening = positive(parameters.opening, 0.12);
	const external = finite(parameters.frondDensity, 0) > 0;
	const parts = Array.from({ length: count }, (_, index) => {
		return createGillPart(
			index,
			count,
			length,
			opening,
			external
		);
	});
	return joinMeshParts(parts);
}

/** Creates one slit/frond tube at its deterministic bilateral offset. */
function createGillPart(index, count, length, opening, external) {
	const centered = index - (count - 1) / 2;
	const x = centered * opening * 0.55;
	const end = external
		? [x + centered * opening * 0.12, length, opening * 0.35]
		: [x, length, 0];
	const radius = external
		? opening * 0.1
		: opening * 0.06;
	return {
		id: `gill-${index + 1}`,
		...buildTubeFromCommand({
			args: {
				start: [x, 0, 0],
				end,
				start_radius: radius,
				end_radius: Math.max(0.0005, radius * 0.55),
				radial_segments: 6,
				longitudinal_segments: 3
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
