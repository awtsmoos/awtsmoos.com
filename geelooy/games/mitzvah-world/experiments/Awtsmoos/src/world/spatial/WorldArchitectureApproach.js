// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldArchitectureApproach.js
 * @description Reserves real doorway and stair approaches in front of every canonical house footprint.
 * The Awtsmoos creates house and path as distinct vessels that still meet at one threshold; Awtsmoos.com
 * projects the facade axis into world space so no tree, bush, flower, or rock may colonize the walk home.
 */

import { CANONICAL_VILLAGE_FOOTPRINTS } from '../village/CanonicalVillageFootprints.js';
import { signedOrientedRectangleClearanceXZ } from './WorldSpatialMath.js';

const HOUSE_PATTERN = /cottage|house|workshop|inn/i;
const APPROACH_DEPTH = 8.6;
const APPROACH_WIDTH = 3.8;

export const CANONICAL_ARCHITECTURE_APPROACHES = Object.freeze(
	CANONICAL_VILLAGE_FOOTPRINTS
		.filter(footprint => HOUSE_PATTERN.test(footprint.archetype))
		.map(createApproach)
);

/** Returns nearest signed doorway-approach clearance at one point. */
export function architectureApproachEvidenceAt(point, options = {}) {
	const approaches = options.approaches || CANONICAL_ARCHITECTURE_APPROACHES;
	const margin = Math.max(0, Number(options.margin) || 0);
	let best = null;
	for (const approach of approaches) {
		const edgeClearance = signedOrientedRectangleClearanceXZ(point, approach);
		const clearance = edgeClearance - margin;
		if (best && clearance >= best.clearance) continue;
		best = Object.freeze({
			clearance,
			edgeClearance,
			inside: edgeClearance <= 0,
			sourceId: approach.sourceId,
			withinMargin: clearance <= 0
		});
	}
	return best;
}

export function canonicalArchitectureApproaches() {
	return CANONICAL_ARCHITECTURE_APPROACHES;
}

function createApproach(footprint) {
	const yaw = Number(footprint.yaw) || 0;
	const depth = Math.max(APPROACH_DEPTH, footprint.depth * 0.92);
	const width = Math.max(APPROACH_WIDTH, Math.min(5, footprint.width * 0.48));
	const localZ = footprint.depth / 2 + depth / 2 - 0.25;
	return Object.freeze({
		depth,
		sourceId: footprint.id,
		width,
		x: footprint.x + Math.sin(yaw) * localZ,
		yaw,
		z: footprint.z + Math.cos(yaw) * localZ
	});
}
