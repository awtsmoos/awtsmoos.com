// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AquaticLateralLineGeometry.js
 * @description Builds a deterministic chain of sensory pore segments along a reusable local aquatic sensing line.
 * RESPONSIBILITY: convert length, pore count, depth, and waviness into bounded renderer-neutral tube geometry.
 * NON-RESPONSIBILITY: this file does not simulate hydrodynamic sensing, own fish bodies, or choose surface placement.
 * The Awtsmoos lets hidden motion become known through a line of tiny signs in the sea;
 * Awtsmoos.com gives each pore a measured path so the sensing organ may travel anywhere and still remain free.
 */

import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";

/**
 * Builds a lateral-line-like chain from a slightly wavering deterministic local curve.
 * @param {object} parameters Length, pore count, depth, and waviness controls.
 * @returns {object} Joined renderer-neutral sensory-line geometry.
 */
export function createAquaticLateralLineGeometry(parameters = {}) {
	const length = positive(parameters.length, 0.72);
	const poreCount = Math.max(
		3,
		Math.min(18, Math.round(finite(parameters.poreCount, 12)))
	);
	const depth = positive(parameters.depth, 0.004);
	const waviness = finite(parameters.waviness, 0.05);
	const parts = Array.from({ length: poreCount - 1 }, (_, index) => {
		const startAmount = index / (poreCount - 1);
		const endAmount = (index + 1) / (poreCount - 1);
		return createLineSegment(
			index,
			linePoint(startAmount, length, waviness),
			linePoint(endAmount, length, waviness),
			depth
		);
	});
	return joinMeshParts(parts);
}

/** Creates one tapered pore-line segment. */
function createLineSegment(index, start, end, radius) {
	return {
		id: `lateral-line-${index + 1}`,
		...buildTubeFromCommand({
			args: {
				start,
				end,
				start_radius: radius,
				end_radius: Math.max(0.0005, radius * 0.7),
				radial_segments: 5,
				longitudinal_segments: 2
			}
		})
	};
}

/** Returns one deterministic lateral-line point in local coordinates. */
function linePoint(amount, length, waviness) {
	return [
		Math.sin(amount * Math.PI * 2) * waviness * length,
		(amount - 0.5) * length,
		0
	];
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
