// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SuckerFieldGeometry.js
 * @description Arranges independent concave sucker cups into bounded deterministic rows suitable for tentacles or arbitrary surfaces.
 * RESPONSIBILITY: count, rows, spacing, stagger, size gradient, and joined renderer-neutral geometry.
 * NON-RESPONSIBILITY: this module does not bind suckers to a tentacle, project onto curved surfaces, simulate adhesion, or own species.
 * The Awtsmoos repeats one hollow cup through measured rows, while Awtsmoos.com keeps each field detachable from every arm;
 * octopus, squid, frog-like fantasy hand, wall, vehicle, vine, or stranger target may receive the same gripping charm.
 */

import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { boundedAppendageInteger, clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";
import { createSuckerCupGeometry } from "./SuckerCupGeometry.js";

/** Creates one flat local sucker field facing along local +Z. */
export function createSuckerFieldGeometry(parameters = {}) {
	const count = boundedAppendageInteger(parameters.count, 12, 1, 40);
	const rows = boundedAppendageInteger(parameters.rows, 2, 1, 4);
	const radius = positiveAppendageNumber(parameters.radius, 0.012);
	const depth = positiveAppendageNumber(parameters.depth, 0.008);
	const spacing = positiveAppendageNumber(parameters.spacing, 0.035);
	const taper = clampAppendageNumber(parameters.taper, 0, 1, 0.22);
	const parts = Array.from({ length: count }, (_, index) => createPlacedCup({
		index,
		count,
		rows,
		radius,
		depth,
		spacing,
		taper
	}));
	return joinMeshParts(parts);
}

/** Places one cup in a deterministic staggered row and gradually tapers its size. */
function createPlacedCup(values) {
	const row = values.index % values.rows;
	const column = Math.floor(values.index / values.rows);
	const columns = Math.ceil(values.count / values.rows);
	const centeredColumn = column - (columns - 1) * 0.5;
	const centeredRow = row - (values.rows - 1) * 0.5;
	const stagger = row % 2 === 0 ? 0 : values.spacing * 0.35;
	const progress = values.count === 1 ? 0 : values.index / (values.count - 1);
	const scale = Math.max(0.35, 1 - values.taper * progress);
	return {
		id: `sucker-${values.index + 1}`,
		...createSuckerCupGeometry({
			radius: values.radius * scale,
			depth: values.depth * scale,
			origin: [centeredRow * values.spacing, centeredColumn * values.spacing + stagger]
		})
	};
}
