// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HumanEarShapeGeometry.js
 * @description Builds the specifically Medabeir external-ear shape in local coordinates before Yesod transport.
 * RESPONSIBILITY: reveal auricle shell, helix, antihelix, concha, tragus, antitragus, and lobule from human-ear proportions.
 * NON-RESPONSIBILITY: this file does not place ears on heads, compile ruminant ears, simulate hearing, or own cartilage animation.
 * The Awtsmoos gathers distant sound through curve within curve, while every fold remains a vessel of one light;
 * Awtsmoos.com lets the human ear keep helix, concha, tragus, and lobule distinct, measured, mirrored, and bright.
 */

import { buildMembrane } from "../../../geometry/membraneBuilder.js";
import { buildEllipsoidFromCommand, buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";

/**
 * Builds one complete human external ear in local coordinates.
 * @param {object} parameters Height, width, cup depth, and biological side metadata.
 * @returns {object} Joined renderer-neutral human-ear geometry.
 */
export function createHumanEarShapeGeometry(parameters = {}) {
	const height = positive(parameters.height, 0.062);
	const width = positive(parameters.width, 0.034);
	const depth = positive(parameters.cupDepth, 0.014);
	const side = parameters.biologicalMetadata?.side === "right" ? -1 : 1;
	const parts = [
		{
			id: "auricle-shell",
			...createAuricleShell(width, height, depth, side)
		},
		...createFoldParts(width, height, depth, side),
		...createSoftRegionParts(width, height, depth, side)
	];
	return {
		...joinMeshParts(parts),
		doubleSided: true
	};
}

/** Builds the soft outer auricle membrane in local ear coordinates. */
function createAuricleShell(width, height, depth, side) {
	return buildMembrane([
		[side * width * 0.14, -height * 0.48, 0],
		[side * width * 0.46, -height * 0.28, depth * 0.08],
		[side * width * 0.5, height * 0.08, depth * 0.04],
		[side * width * 0.3, height * 0.46, 0],
		[-side * width * 0.18, height * 0.5, 0],
		[-side * width * 0.42, height * 0.18, depth * 0.04],
		[-side * width * 0.26, -height * 0.28, depth * 0.06]
	], {
		double_sided: true
	});
}

/** Creates the helix and antihelix cartilage ridges as separate smooth tubes. */
function createFoldParts(width, height, depth, side) {
	return [
		createTube("helix-upper", [-side * width * 0.16, height * 0.4, depth * 0.06], [side * width * 0.32, height * 0.28, depth * 0.12], width * 0.055),
		createTube("helix-side", [side * width * 0.32, height * 0.28, depth * 0.12], [side * width * 0.36, -height * 0.22, depth * 0.1], width * 0.052),
		createTube("antihelix", [-side * width * 0.08, height * 0.16, depth * 0.18], [side * width * 0.08, -height * 0.22, depth * 0.22], width * 0.045),
		createTube("antihelix-branch", [-side * width * 0.08, height * 0.16, depth * 0.18], [side * width * 0.18, height * 0.3, depth * 0.16], width * 0.04)
	];
}

/** Creates concha, tragus, antitragus, and lobule soft/cartilage volumes. */
function createSoftRegionParts(width, height, depth, side) {
	return [
		createRegion("concha", [side * width * 0.06, -height * 0.02, depth * 0.42], [width * 0.24, height * 0.2, depth * 0.34]),
		createRegion("tragus", [side * width * 0.3, -height * 0.12, depth * 0.48], [width * 0.1, height * 0.1, depth * 0.18]),
		createRegion("antitragus", [side * width * 0.18, -height * 0.25, depth * 0.4], [width * 0.09, height * 0.08, depth * 0.16]),
		createRegion("lobule", [side * width * 0.05, -height * 0.43, depth * 0.16], [width * 0.2, height * 0.14, depth * 0.2])
	];
}

/** Builds one named tapered cartilage ridge tube. */
function createTube(id, start, end, radius) {
	return {
		id,
		...buildTubeFromCommand({
			args: {
				start,
				end,
				start_radius: radius,
				end_radius: radius * 0.72,
				radial_segments: 6,
				longitudinal_segments: 3
			}
		})
	};
}

/** Builds one named smooth soft-tissue/cartilage region. */
function createRegion(id, center, radii) {
	return {
		id,
		...buildEllipsoidFromCommand({
			args: {
				center,
				radii,
				vertical_segments: 8,
				radial_segments: 12
			}
		})
	};
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
