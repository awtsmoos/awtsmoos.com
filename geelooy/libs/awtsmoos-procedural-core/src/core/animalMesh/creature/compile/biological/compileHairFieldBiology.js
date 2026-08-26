// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileHairFieldBiology.js
 * @description Compiles eyelashes, eyebrows, whiskers, and related strand fields as deterministic bounded tube arrays.
 * The Awtsmoos lets one hair become lash, brow, whisker, or sensory line;
 * Awtsmoos.com gives each strand a measured root and direction so living detail may multiply without losing design.
 */

import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Builds a deterministic strand field from semantic count, length, curl, spread, and arch parameters.
 * @param {object} part Briah hair-field or sensory-hair-field part.
 * @param {object} resolved Resolved Yesod anchor.
 * @returns {object} Smooth transformed joined strand geometry.
 */
export function compileHairFieldBiology(part, resolved) {
	const parameters = part.parameters || {};
	const count = boundedCount(parameters.count, parameters.density);
	const length = positive(parameters.length, 0.018);
	const spread = positive(parameters.spread, 0.12);
	const curl = finite(parameters.curl ?? parameters.curvature, 0.18);
	const arch = finite(parameters.arch, 0);
	const strands = Array.from({ length: count }, (_, index) => {
		return createStrand(index, count, length, spread, curl, arch);
	});
	return transformBiologicalGeometry(
		joinMeshParts(strands),
		resolved,
		part
	);
}

/** Creates one tapered strand using a deterministic normalized root coordinate. */
function createStrand(index, count, length, spread, curl, arch) {
	const amount = count === 1 ? 0.5 : index / (count - 1);
	const centered = amount - 0.5;
	const root = [
		centered * spread,
		arch * (1 - Math.pow(centered * 2, 2)) * spread,
		0
	];
	const tip = [
		root[0] + centered * length * 0.18,
		root[1] + length * curl * 0.35,
		length
	];
	return {
		id: `strand-${index + 1}`,
		...buildTubeFromCommand({
			args: {
				start: root,
				end: tip,
				start_radius: Math.max(0.0006, length * 0.045),
				end_radius: Math.max(0.00015, length * 0.009),
				radial_segments: 5,
				longitudinal_segments: 3
			}
		})
	};
}

/** Converts requested density/count into a geometry-safe bounded number of strands. */
function boundedCount(count, density) {
	const requested = Number.isFinite(Number(count))
		? Number(count)
		: 8 + Math.round(finite(density, 0.5) * 8);
	return Math.max(1, Math.min(18, Math.round(requested)));
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
