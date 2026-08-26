// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherArrayGeometry.js
 * @description Arranges reusable individual feathers into bounded linear rows or radial fans without inventing a second feather topology.
 * RESPONSIBILITY: deterministic array placement, overlap-aware spacing, fan arc, sweep, and joined renderer-neutral output.
 * NON-RESPONSIBILITY: this module does not own turkey tails, bird wings, renderer instancing, wind, materials, or attachment resolution.
 * The Awtsmoos repeats one feather law through orderly multiplicity, while Awtsmoos.com keeps the array merely a grammar of place;
 * tail fan, crest, wing row, display halo, or feathers upon a horn can therefore share one composable grace.
 */

import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { boundedAppendageInteger, clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";
import { createFeatherGeometry } from "./FeatherGeometry.js";

/** Creates a feather row or fan from an explicit array recipe. */
export function createFeatherArrayGeometry(parameters = {}) {
	const recipe = String(parameters.biologicalGeometryRecipe || "linear-feather-row");
	return recipe === "radial-feather-fan"
		? createFan(parameters)
		: createRow(parameters);
}

/** Creates a radial fan with bounded count and deterministic angular spacing. */
function createFan(parameters) {
	const count = boundedAppendageInteger(parameters.featherCount ?? parameters.count, 16, 1, 32);
	const arc = clampAppendageNumber(parameters.arc, 0, Math.PI * 1.9, Math.PI * 0.9);
	const radius = positiveAppendageNumber(parameters.radius, 0.2);
	const parts = Array.from({ length: count }, (_, index) => {
		const fraction = count === 1 ? 0.5 : index / (count - 1);
		const angle = (fraction - 0.5) * arc;
		return {
			id: `feather-fan-${index + 1}`,
			...createFeatherGeometry({
				...arrayFeatherParameters(parameters),
				angle,
				origin: [Math.sin(angle) * radius * 0.08, 0, Math.cos(angle) * radius * 0.04]
			})
		};
	});
	return joinMeshParts(parts);
}

/** Creates a linear feather row with sweep and overlap-aware separation. */
function createRow(parameters) {
	const count = boundedAppendageInteger(parameters.count, 10, 1, 24);
	const spacing = positiveAppendageNumber(parameters.spacing, 0.045);
	const overlap = clampAppendageNumber(parameters.overlap, 0, 0.9, 0.28);
	const sweep = clampAppendageNumber(parameters.sweep, -1, 1, 0.16);
	const effectiveSpacing = spacing * (1 - overlap * 0.55);
	const parts = Array.from({ length: count }, (_, index) => {
		const centered = index - (count - 1) * 0.5;
		return {
			id: `feather-row-${index + 1}`,
			...createFeatherGeometry({
				...arrayFeatherParameters(parameters),
				angle: sweep * centered / Math.max(1, count - 1),
				origin: [centered * effectiveSpacing, 0, 0]
			})
		};
	});
	return joinMeshParts(parts);
}

/** Maps array-level feather dimensions into the individual feather contract. */
function arrayFeatherParameters(parameters) {
	return {
		length: positiveAppendageNumber(parameters.featherLength, 0.28),
		width: positiveAppendageNumber(parameters.featherWidth, 0.08),
		shaftRadius: positiveAppendageNumber(parameters.shaftRadius, 0.0032),
		asymmetry: clampAppendageNumber(parameters.asymmetry, -0.6, 0.6, 0.06),
		curve: clampAppendageNumber(parameters.curve, -1, 1, 0.08)
	};
}
