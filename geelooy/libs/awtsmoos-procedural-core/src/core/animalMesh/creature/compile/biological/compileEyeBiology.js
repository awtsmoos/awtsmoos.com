// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileEyeBiology.js
 * @description Compiles a layered biological eye into smooth renderer-neutral geometry at any Yesod anchor.
 * The Awtsmoos lets vision emerge from creature, wall, tree, or stone;
 * Awtsmoos.com lets globe and cornea follow one semantic frame while every later renderer clothes the eye in tone.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Builds globe and corneal bulge geometry for one biological eye part.
 * @param {object} part Briah eye part.
 * @param {object} resolved Resolved Yesod anchor.
 * @returns {object} Smooth transformed eye geometry.
 */
export function compileEyeBiology(part, resolved) {
	const globe = normalizedGlobe(part.parameters?.globe);
	const cornea = positive(part.parameters?.cornea, 0.09);
	const globeGeometry = buildEllipsoidFromCommand({
		args: {
			center: [0, 0, 0],
			radii: globe,
			vertical_segments: 14,
			radial_segments: 20
		}
	});
	const corneaGeometry = buildEllipsoidFromCommand({
		args: {
			center: [0, 0, globe[2] * (0.78 + cornea * 0.2)],
			radii: [
				globe[0] * 0.62,
				globe[1] * 0.34,
				globe[2] * (0.28 + cornea * 0.5)
			],
			vertical_segments: 10,
			radial_segments: 16
		}
	});
	return transformBiologicalGeometry(
		joinMeshParts([
			{ id: "globe", ...globeGeometry },
			{ id: "cornea", ...corneaGeometry }
		]),
		resolved,
		part
	);
}

/** Returns positive eye radii while accepting semantic array profiles. */
function normalizedGlobe(value) {
	const source = Array.isArray(value) ? value : [0.15, 0.12, 0.14];
	return [0, 1, 2].map(index => {
		return positive(source[index], [0.15, 0.12, 0.14][index]);
	});
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
