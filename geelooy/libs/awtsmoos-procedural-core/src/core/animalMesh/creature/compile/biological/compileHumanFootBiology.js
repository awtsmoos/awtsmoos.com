// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileHumanFootBiology.js
 * @description Compiles a specifically Medabeir foot with heel, longitudinal body, arch lift, and five toes.
 * RESPONSIBILITY: translate human foot length, width, heel, arch, toe count, big-toe scale, and side metadata into local geometry.
 * NON-RESPONSIBILITY: this file does not own leg anatomy, gait, plantar pressure simulation, nail materials, or human archetypes.
 * The Awtsmoos lets the human foot carry one upright path through heel, arch, ball, and toe;
 * Awtsmoos.com keeps that measured Medabeir vessel reusable wherever a new living composition needs to go.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Compiles one human foot with a heel/body volume and five toe volumes.
 * @param {object} part Briah Medabeir foot part.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Smooth transformed human-foot geometry.
 */
export function compileHumanFootBiology(part, resolved) {
	const parameters = part.parameters || {};
	const length = positive(parameters.length, 0.25);
	const width = positive(parameters.width, 0.095);
	const heel = positive(parameters.heel, 0.085);
	const arch = clamp(parameters.arch, 0, 1, 0.42);
	const toeCount = Math.max(1, Math.min(5, Math.round(finite(parameters.toeCount, 5))));
	const bigToeScale = positive(parameters.bigToeScale, 1.18);
	const side = parameters.biologicalMetadata?.side === "right" ? 1 : -1;
	const parts = [
		{
			id: "foot-body",
			...ellipsoid(
				[0, length * 0.06, arch * width * 0.12],
				[width * 0.5, length * 0.44, width * (0.22 + arch * 0.08)]
			)
		},
		{
			id: "heel",
			...ellipsoid(
				[0, -length * 0.38, width * 0.02],
				[heel * 0.48, heel * 0.45, heel * 0.35]
			)
		},
		...createToes(toeCount, side, length, width, bigToeScale)
	];
	return transformBiologicalGeometry(
		joinMeshParts(parts),
		resolved,
		part
	);
}

/** Creates the toe row with a side-aware medial big toe. */
function createToes(count, side, length, width, bigToeScale) {
	return Array.from({ length: count }, (_, index) => {
		const lateral = count === 1
			? 0
			: index / (count - 1) - 0.5;
		const medialIndex = side < 0 ? count - 1 : 0;
		const scale = index === medialIndex
			? bigToeScale
			: 1 - Math.abs(index - medialIndex) * 0.08;
		const radius = width * 0.095 * scale;
		return {
			id: index === medialIndex ? "big-toe" : `toe-${index + 1}`,
			...ellipsoid(
				[lateral * width * 0.82, length * 0.5 + radius * 0.55, 0],
				[radius, radius * 1.35, radius * 0.72]
			)
		};
	});
}

/** Builds one smooth human-foot sub-volume. */
function ellipsoid(center, radii) {
	return buildEllipsoidFromCommand({
		args: {
			center,
			radii,
			vertical_segments: 9,
			radial_segments: 13
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

/** Clamps a finite value into a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	return Math.max(minimum, Math.min(maximum, finite(value, fallback)));
}
