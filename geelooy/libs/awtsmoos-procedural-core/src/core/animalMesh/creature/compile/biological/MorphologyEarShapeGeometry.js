// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MorphologyEarShapeGeometry.js
 * @description Builds profile-driven visible pinnae or reduced ear openings from one reusable external-ear morphology grammar.
 * RESPONSIBILITY: express length, width, cup, point, droop, curl, thickness, topology, protrusion, and side in local coordinates.
 * NON-RESPONSIBILITY: this vessel does not own human auricle folds, hearing simulation, species identity, or Yesod transport.
 * The Awtsmoos lets one listening grammar become rabbit banner, bat membrane, elephant fan, feline spear, or hidden aquatic gate;
 * Awtsmoos.com shapes each local vessel without imprisoning the ear inside the creature whose preset first revealed its state.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { buildVertexNormals } from "../../../geometry/normalBuilder.js";

/**
 * Builds one local profile-driven external ear.
 * @param {object} parameters Resolved morphology and biological metadata.
 * @returns {object} Renderer-neutral ear geometry.
 */
export function createMorphologyEarShapeGeometry(parameters = {}) {
	if (parameters.topology === "reduced" || parameters.topology === "opening") {
		return createReducedEar(parameters);
	}
	return createPinnaShell(parameters);
}

/** Builds a concave eight-point pinna shell with profile-driven droop and curl. */
function createPinnaShell(parameters) {
	const length = positive(parameters.baseLength, 0.25) * positive(parameters.length, 1);
	const width = length * positive(parameters.width, 0.5);
	const cup = length * nonNegative(parameters.cup, 0.2);
	const point = clamp01(parameters.point, 0.25);
	const droop = clamp01(parameters.droop, 0);
	const curl = clamp01(parameters.curl, 0);
	const side = sideSign(parameters.biologicalMetadata?.side);
	const outline = outlinePoints(length, width, point, droop, curl, side);
	const center = [0, -length * droop * 0.08, -cup];
	const positions = [...center, ...outline.flat()];
	const indices = fanIndices(outline.length);
	return {
		boundaries: Object.freeze({ outline: Object.freeze(outline.map((_, index) => index + 1)) }),
		doubleSided: true,
		indices,
		normals: buildVertexNormals(positions, indices),
		positions
	};
}

/** Creates a small fleshy ear opening for reduced-pinna and aquatic morphologies. */
function createReducedEar(parameters) {
	const length = positive(parameters.baseLength, 0.25) * positive(parameters.length, 0.15);
	const width = length * positive(parameters.width, 0.35);
	const depth = Math.max(length * 0.18, nonNegative(parameters.cup, 0.08) * length);
	return buildEllipsoidFromCommand({
		args: {
			center: [0, 0, depth * 0.1],
			radii: [width, length * 0.5, depth],
			vertical_segments: 7,
			radial_segments: 10
		}
	});
}

/** Creates a symmetric local outline and mirrors it when side metadata requests a right ear. */
function outlinePoints(length, width, point, droop, curl, side) {
	const tipWidth = width * (0.42 - point * 0.38);
	const sag = length * droop * 0.4;
	const rim = width * curl * 0.18;
	return [
		[-width * 0.22, -length * 0.5, rim],
		[width * 0.22, -length * 0.5, rim],
		[width * 0.5, -length * 0.2 - sag * 0.2, rim],
		[width * 0.48, length * 0.14 - sag * 0.55, rim],
		[tipWidth, length * 0.5 - sag, 0],
		[-tipWidth, length * 0.5 - sag, 0],
		[-width * 0.48, length * 0.14 - sag * 0.55, -rim],
		[-width * 0.5, -length * 0.2 - sag * 0.2, -rim]
	].map((pointValue) => [side * pointValue[0], pointValue[1], pointValue[2]]);
}

/** Fans one ordered rim around vertex zero. */
function fanIndices(count) {
	const indices = [];
	for (let index = 0; index < count; index += 1) {
		indices.push(0, index + 1, ((index + 1) % count) + 1);
	}
	return indices;
}

/** Maps semantic side labels into deterministic local mirroring. */
function sideSign(side) {
	return side === "right" ? -1 : 1;
}

/** Returns a positive finite scalar or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a non-negative finite scalar or fallback. */
function nonNegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

/** Clamps one morphology scalar to the normalized range. */
function clamp01(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : fallback;
}
