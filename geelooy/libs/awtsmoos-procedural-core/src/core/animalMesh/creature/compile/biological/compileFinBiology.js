// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileFinBiology.js
 * @description Compiles flexible fin membrane and structural rays in a target-local Yesod frame.
 * The Awtsmoos lets a fin propel fish or crown a cow, wall, dragon, or tree;
 * Awtsmoos.com keeps ray and membrane one flowing organ while semantic anchors let placement remain free.
 */

import { buildMembrane } from "../../../geometry/membraneBuilder.js";
import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Builds one fin membrane plus a quality-bounded set of structural rays.
 * @param {object} part Briah fin part.
 * @param {object} resolved Resolved Yesod anchor.
 * @returns {object} Smooth transformed fin geometry.
 */
export function compileFinBiology(part, resolved) {
	const parameters = part.parameters || {};
	const length = positive(parameters.length, 0.42);
	const height = positive(parameters.height, 0.26);
	const sweep = finite(parameters.sweep, 0.18);
	const fork = clamp(parameters.fork, 0, 0.9, 0);
	const outline = finOutline(length, height, sweep, fork);
	const membrane = {
		id: "fin-membrane",
		...buildMembrane(outline, { double_sided: true })
	};
	const rays = createFinRays(outline, parameters.rayCount);
	const joined = joinMeshParts([membrane, ...rays]);
	return transformBiologicalGeometry(
		{ ...joined, doubleSided: true },
		resolved,
		part
	);
}

/** Creates an ordered local outline that stays valid for forked and unforked fins. */
function finOutline(length, height, sweep, fork) {
	return [
		[0, -length * 0.5, 0],
		[0, -length * 0.2, height * 0.58],
		[0, sweep * length - fork * length * 0.14, height],
		[0, sweep * length + fork * length * 0.18, height * (0.72 - fork * 0.18)],
		[0, length * 0.5, height * 0.16]
	];
}

/** Builds a small deterministic ray set without exploding geometry budgets. */
function createFinRays(outline, requestedCount) {
	const rayCount = Math.max(2, Math.min(6, Math.round(positive(requestedCount, 4))));
	const rootStart = outline[0];
	const rootEnd = outline[4];
	return Array.from({ length: rayCount }, (_, index) => {
		const amount = index / Math.max(1, rayCount - 1);
		const start = interpolate(rootStart, rootEnd, amount);
		const targetIndex = Math.min(3, 1 + Math.round(amount * 2));
		const end = outline[targetIndex];
		return {
			id: `fin-ray-${index + 1}`,
			...buildTubeFromCommand({
				args: {
					start,
					end,
					start_radius: 0.006,
					end_radius: 0.002,
					radial_segments: 6,
					longitudinal_segments: 3
				}
			})
		};
	});
}

/** Linearly interpolates two local points. */
function interpolate(start, end, amount) {
	return start.map((value, index) => value + (end[index] - value) * amount);
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

/** Clamps a finite number into a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	return Math.max(minimum, Math.min(maximum, finite(value, fallback)));
}
