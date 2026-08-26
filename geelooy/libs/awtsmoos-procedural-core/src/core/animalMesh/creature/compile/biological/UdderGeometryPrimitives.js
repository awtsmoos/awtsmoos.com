// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UdderGeometryPrimitives.js
 * @description Owns normalized udder dimensions and the established smooth primitive calls used by the mammary shape assembler.
 * RESPONSIBILITY: validate bounded semantic parameters and reveal named lobe/teat mesh vessels without deciding their spatial arrangement.
 * NON-RESPONSIBILITY: this module does not choose teat layout, join parts, resolve anchors, own species, or create renderer materials.
 * The Awtsmoos gives measure to width and depth, then clothes each measure in a lawful primitive ray;
 * Awtsmoos.com keeps validation apart from arrangement, so future anatomy may deepen without tangling the way.
 */

import {
	buildEllipsoidFromCommand,
	buildTubeFromCommand
} from "../../../geometry/primitiveBuilder.js";

/**
 * Normalizes public udder parameters into a finite bounded local-shape contract.
 * @param {object} parameters User or archetype morphology controls.
 * @returns {object} Safe deterministic dimensions.
 */
export function normalizeUdderDimensions(parameters = {}) {
	return {
		width: positive(parameters.width, 0.32),
		length: positive(parameters.length, 0.34),
		depth: positive(parameters.depth, 0.2),
		fullness: clamp(parameters.fullness, 0, 1, 0.55),
		teatCount: clampInteger(parameters.teatCount, 0, 8, 4),
		teatLength: positive(parameters.teatLength, 0.09)
	};
}

/** Builds one named smooth udder lobe without imposing assembly placement policy. */
export function createUdderLobe(id, center, radii) {
	return {
		id,
		...buildEllipsoidFromCommand({
			args: {
				center,
				radii,
				vertical_segments: 9,
				radial_segments: 14
			}
		})
	};
}

/** Builds one named tapered teat tube along the caller-provided local axis. */
export function createUdderTeat(id, start, end, radius) {
	return {
		id,
		...buildTubeFromCommand({
			args: {
				start,
				end,
				start_radius: radius,
				end_radius: radius * 0.68,
				radial_segments: 10,
				longitudinal_segments: 5
			}
		})
	};
}

/** Returns a positive finite scalar or the semantic fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Clamps one finite scalar into a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	const finiteValue = Number.isFinite(number) ? number : fallback;
	return Math.max(minimum, Math.min(maximum, finiteValue));
}

/** Clamps and rounds one bounded morphology count. */
function clampInteger(value, minimum, maximum, fallback) {
	return Math.round(clamp(value, minimum, maximum, fallback));
}
