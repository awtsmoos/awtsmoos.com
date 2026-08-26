// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherGeometry.js
 * @description Builds one independent feather from a tapered shaft and paired smooth vane membranes.
 * RESPONSIBILITY: reveal shaft, vane width/asymmetry, curve, origin, and planar rotation in renderer-neutral local geometry.
 * NON-RESPONSIBILITY: this vessel does not own bird species, feather tracts, array placement, wind simulation, materials, or attachment frames.
 * The Awtsmoos joins shaft and vane as one feathered sign, while Awtsmoos.com keeps the single feather free from every flock;
 * eagle, turkey, angelic wing, eyebrow, horn, wall, or fantasy creature may receive the same reusable law upon its dock.
 */

import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { buildMembrane } from "../../../geometry/membraneBuilder.js";
import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";

/** Creates one shaft-and-vane feather in local biological coordinates. */
export function createFeatherGeometry(parameters = {}) {
	const shape = normalizeFeather(parameters);
	const shaft = createShaft(shape);
	const vane = createVanes(shape);
	return joinMeshParts([shaft, ...vane]);
}

/** Normalizes one feather while preserving array-provided origin and angle. */
function normalizeFeather(parameters) {
	return {
		length: positiveAppendageNumber(parameters.length ?? parameters.featherLength, 0.2),
		width: positiveAppendageNumber(parameters.width ?? parameters.featherWidth, 0.065),
		shaftRadius: positiveAppendageNumber(parameters.shaftRadius, 0.003),
		asymmetry: clampAppendageNumber(parameters.asymmetry, -0.6, 0.6, 0.08),
		curve: clampAppendageNumber(parameters.curve, -1, 1, 0.08),
		angle: Number.isFinite(Number(parameters.angle)) ? Number(parameters.angle) : 0,
		origin: validOrigin(parameters.origin)
	};
}

/** Builds a tapered shaft with a small biological curvature. */
function createShaft(shape) {
	const start = point(shape, 0, 0, 0);
	const middle = point(shape, 0, shape.curve * shape.length * 0.05, shape.length * 0.55);
	const end = point(shape, 0, shape.curve * shape.length * 0.12, shape.length);
	return {
		id: "feather-shaft",
		...buildTubeFromCommand({
			args: {
				centerline: [start, middle, end],
				start_radius: shape.shaftRadius,
				end_radius: shape.shaftRadius * 0.28,
				radial_segments: 7,
				longitudinal_segments: 5
			}
		})
	};
}

/** Builds separate left/right vane membranes so the shaft remains a structural seam. */
function createVanes(shape) {
	const leftWidth = shape.width * 0.5 * (1 + shape.asymmetry);
	const rightWidth = shape.width * 0.5 * (1 - shape.asymmetry);
	const root = point(shape, 0, 0, shape.length * 0.08);
	const tip = point(shape, 0, shape.curve * shape.length * 0.12, shape.length * 0.98);
	return [
		{
			id: "feather-vane-left",
			...buildMembrane([
				root,
				point(shape, -leftWidth * 0.62, 0, shape.length * 0.28),
				point(shape, -leftWidth, shape.curve * shape.length * 0.05, shape.length * 0.62),
				tip
			], { double_sided: true })
		},
		{
			id: "feather-vane-right",
			...buildMembrane([
				root,
				point(shape, rightWidth * 0.62, 0, shape.length * 0.28),
				point(shape, rightWidth, shape.curve * shape.length * 0.05, shape.length * 0.62),
				tip
			], { double_sided: true })
		}
	];
}

/** Rotates a feather-local point about Y, then translates by the array origin. */
function point(shape, x, y, z) {
	const cosine = Math.cos(shape.angle);
	const sine = Math.sin(shape.angle);
	return [
		shape.origin[0] + x * cosine + z * sine,
		shape.origin[1] + y,
		shape.origin[2] - x * sine + z * cosine
	];
}

/** Accepts only a finite XYZ origin. */
function validOrigin(origin) {
	return Array.isArray(origin) && origin.length === 3 && origin.every(Number.isFinite)
		? [...origin]
		: [0, 0, 0];
}
