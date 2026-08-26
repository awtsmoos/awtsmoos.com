// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CaudalFinGeometry.js
 * @description Builds paired upper/lower caudal membranes with independent lobe scaling and bounded structural rays.
 * RESPONSIBILITY: fork/notch depth, span, length, heterocercal asymmetry, and shared fin-plane orientation consistent with existing fin geometry.
 * NON-RESPONSIBILITY: this vessel does not own fish species, body envelopes, swimming simulation, materials, or attachment resolution.
 * The Awtsmoos divides one tail into upper and lower lobes without dividing the law from which their motion springs;
 * Awtsmoos.com lets forked, lunate, shark-like, rounded, or fantasy caudal forms attach to any creature or stranger thing.
 */

import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { buildMembrane } from "../../../geometry/membraneBuilder.js";
import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { boundedAppendageInteger, clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";

/** Creates one paired caudal fin in the same local Y-Z plane used by generic fins. */
export function createCaudalFinGeometry(parameters = {}) {
	const shape = normalizeCaudal(parameters);
	const upper = lobeOutline(shape, 1, shape.upperScale);
	const lower = lobeOutline(shape, -1, shape.lowerScale);
	const parts = [
		{ id: "caudal-upper", ...buildMembrane(upper, { double_sided: true }) },
		{ id: "caudal-lower", ...buildMembrane(lower, { double_sided: true }) },
		...createRays(upper, "upper", shape),
		...createRays(lower, "lower", shape)
	];
	return { ...joinMeshParts(parts), doubleSided: true };
}

/** Normalizes caudal shape and protects the real-time geometry budget. */
function normalizeCaudal(parameters) {
	return {
		length: positiveAppendageNumber(parameters.length, 0.4),
		span: positiveAppendageNumber(parameters.span, 0.3),
		notch: clampAppendageNumber(parameters.notch, 0, 0.75, 0.25),
		upperScale: clampAppendageNumber(parameters.upperScale, 0.25, 1.8, 1),
		lowerScale: clampAppendageNumber(parameters.lowerScale, 0.25, 1.8, 1),
		rayCount: boundedAppendageInteger(parameters.rayCount, 5, 2, 6)
	};
}

/** Builds one simple lobe polygon so fan triangulation never crosses a concave whole-tail outline. */
function lobeOutline(shape, direction, scale) {
	const span = shape.span * scale * direction;
	const notchY = shape.length * (0.88 - shape.notch * 0.34);
	return [
		[0, 0, 0],
		[0, shape.length * 0.32, span * 0.52],
		[0, shape.length, span],
		[0, notchY, span * (0.08 + shape.notch * 0.08)]
	];
}

/** Creates bounded structural rays from the shared root into one membrane lobe. */
function createRays(outline, label, shape) {
	const baseRadius = Math.min(shape.length, shape.span) * 0.018;
	return Array.from({ length: shape.rayCount }, (_, index) => {
		const amount = index / Math.max(1, shape.rayCount - 1);
		const end = interpolate(outline[1], outline[2], amount);
		return {
			id: `caudal-${label}-ray-${index + 1}`,
			...buildTubeFromCommand({
				args: {
					start: [0, 0, 0],
					end,
					start_radius: baseRadius,
					end_radius: baseRadius * 0.34,
					radial_segments: 6,
					longitudinal_segments: 3
				}
			})
		};
	});
}

/** Interpolates two local points. */
function interpolate(start, end, amount) {
	return start.map((value, index) => value + (end[index] - value) * amount);
}
