// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileTongueBiology.js
 * @description Compiles standalone human, mammal, feline, snake, and future tongue profiles as flexible local lofts.
 * RESPONSIBILITY: turn tongue length, width, thickness, fork, and papillae intent into renderer-neutral geometry at a Yesod frame.
 * NON-RESPONSIBILITY: this file does not own mouth cavities, dental anatomy, speech solvers, or tongue rig simulation.
 * The Awtsmoos lets one tongue speak, taste, fork, curl, or reach while remaining one living sign;
 * Awtsmoos.com gives every variation a measured vessel so oral assemblies may compose it by design.
 */

import { buildEllipticalLoft } from "../../../geometry/ellipticalLoft.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Compiles one tongue with an optional forked terminal pair.
 * @param {object} part Briah tongue part carrying morphology parameters.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Smooth renderer-neutral tongue geometry.
 */
export function compileTongueBiology(part, resolved) {
	const parameters = part.parameters || {};
	const length = positive(parameters.length, 0.22);
	const width = positive(parameters.width, 0.08);
	const thickness = positive(parameters.thickness, 0.035);
	const forkCount = Math.max(0, Math.min(2, Math.round(finite(parameters.fork, 0))));
	const baseLength = forkCount > 0 ? length * 0.7 : length;
	const parts = [
		{
			id: "tongue-body",
			...tongueLoft([0, 0, 0], [0, 0, baseLength], width, thickness)
		}
	];
	if (forkCount > 0) {
		parts.push(...forkedTips(baseLength, length, width, thickness));
	}
	return transformBiologicalGeometry(
		joinMeshParts(parts),
		resolved,
		part
	);
}

/** Creates the bilateral terminal tips of a forked tongue. */
function forkedTips(baseLength, fullLength, width, thickness) {
	const reach = fullLength - baseLength;
	return [-1, 1].map((side) => {
		return {
			id: side < 0 ? "tongue-fork-left" : "tongue-fork-right",
			...tongueLoft(
				[0, 0, baseLength * 0.94],
				[side * width * 0.42, 0, baseLength + reach],
				width * 0.34,
				thickness * 0.58
			)
		};
	});
}

/** Builds one tapered soft-tissue tongue section between two local points. */
function tongueLoft(start, end, width, thickness) {
	return buildEllipticalLoft({
		centerline: [start, end],
		sections: [
			section(0, width * 0.5, thickness * 0.5),
			section(0.65, width * 0.42, thickness * 0.42),
			section(1, width * 0.14, thickness * 0.16)
		],
		radial_segments: 9,
		longitudinal_segments: 7
	}, {
		cap_start: true,
		cap_end: true
	});
}

/** Creates one flattened tongue loft section. */
function section(amount, halfWidth, halfHeight) {
	return {
		t: amount,
		half_width: halfWidth,
		half_height: halfHeight,
		rotation: 0
	};
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
