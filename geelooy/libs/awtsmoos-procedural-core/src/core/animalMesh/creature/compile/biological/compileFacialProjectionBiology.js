// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileFacialProjectionBiology.js
 * @description Compiles reusable snouts, human noses, and independent nares as smooth target-local facial projections.
 * RESPONSIBILITY: create projection volumes and visible nostril openings from semantic dimensions without requiring a head archetype.
 * NON-RESPONSIBILITY: this file does not own beaks, lips, olfactory simulation, species proportions, or face assembly placement.
 * The Awtsmoos lets breath find an opening in human face, bovine muzzle, creature, rock, or wall;
 * Awtsmoos.com gives projection and nare one measured frame while species remain compositions rather than owners of all.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Compiles snout, nose, or nare categories through one bounded facial-projection family.
 * @param {object} part Briah facial-projection part.
 * @param {object} resolved Resolved Yesod anchor and transported frame.
 * @returns {object|null} Smooth transformed geometry or null for unsupported categories.
 */
export function compileFacialProjectionBiology(part, resolved) {
	const category = String(part?.semanticCategory || "");
	if (category === "snout") {
		return transformBiologicalGeometry(createSnout(part.parameters), resolved, part);
	}
	if (category === "nose") {
		return transformBiologicalGeometry(createHumanNose(part.parameters), resolved, part);
	}
	if (category === "nare") {
		return transformBiologicalGeometry(createNares(part.parameters), resolved, part);
	}
	return null;
}

/** Builds an elongated muzzle with a broad terminal nose pad and paired openings. */
function createSnout(parameters = {}) {
	const length = positive(parameters.length, 0.34);
	const width = positive(parameters.width, 0.28);
	const height = positive(parameters.height, 0.2);
	return joinMeshParts([
		part("muzzle", ellipsoid([0, 0, length * 0.34], [width * 0.5, height * 0.5, length * 0.5], 13)),
		part("nose-pad", ellipsoid([0, 0, length * 0.82], [width * 0.48, height * 0.38, length * 0.18], 11)),
		...nareParts(width * 0.5, height * 0.12, length * 0.96, parameters.nostrils)
	]);
}

/** Builds a specifically human bridge-tip-ala projection with paired nostrils. */
function createHumanNose(parameters = {}) {
	const length = positive(parameters.length, 0.055);
	const width = positive(parameters.width, 0.036);
	const projection = positive(parameters.projection, 0.028);
	return joinMeshParts([
		part("bridge", ellipsoid([0, length * 0.2, projection * 0.35], [width * 0.28, length * 0.48, projection * 0.42], 10)),
		part("tip", ellipsoid([0, -length * 0.16, projection * 0.78], [width * 0.42, length * 0.24, projection * 0.36], 10)),
		part("left-ala", ellipsoid([-width * 0.34, -length * 0.22, projection * 0.62], [width * 0.22, length * 0.16, projection * 0.22], 8)),
		part("right-ala", ellipsoid([width * 0.34, -length * 0.22, projection * 0.62], [width * 0.22, length * 0.16, projection * 0.22], 8)),
		...nareParts(width * 0.42, length * 0.06, projection * 0.94, 2)
	]);
}

/** Builds standalone nostril/blowhole opening volumes without requiring a nose. */
function createNares(parameters = {}) {
	const count = Math.max(1, Math.min(2, Math.round(finite(parameters.count, 2))));
	const width = positive(parameters.width, 0.025);
	const height = positive(parameters.height, 0.012);
	const depth = positive(parameters.depth, 0.018);
	return joinMeshParts(nareParts(width * 1.2, height, depth * 0.4, count));
}

/** Creates one or two small recessed-looking nare volumes at a local Z position. */
function nareParts(spacing, radius, z, requestedCount = 2) {
	const count = Math.max(1, Math.min(2, Math.round(finite(requestedCount, 2))));
	return Array.from({ length: count }, (_, index) => {
		const x = count === 1 ? 0 : (index === 0 ? -1 : 1) * spacing * 0.5;
		return part(`nare-${index + 1}`, ellipsoid([x, -radius * 0.25, z], [radius, radius * 0.55, radius * 0.42], 7));
	});
}

/** Wraps geometry with an id for the established mesh joiner. */
function part(id, geometry) {
	return { id, ...geometry };
}

/** Builds one smooth ellipsoid with bounded segment counts. */
function ellipsoid(center, radii, segments) {
	return buildEllipsoidFromCommand({
		args: {
			center,
			radii,
			vertical_segments: segments,
			radial_segments: Math.max(10, segments + 3)
		}
	});
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a finite value or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
