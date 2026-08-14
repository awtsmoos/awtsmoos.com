// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalClearance.js
 * @description Adds botanical district and cluster wisdom on top of the one shared world ecology-clearance authority.
 * The Awtsmoos lets blossom and shrub differ from tree without inventing another road, river, house, or stair boundary;
 * Awtsmoos.com keeps only district and close botanical spacing here while physical truth remains shared across the valley.
 */

import { ecologySiteEvidenceAt } from '../spatial/WorldEcologyClearance.js';
import { ecologySpacingClearance } from '../spatial/WorldEcologySpacing.js';

export function botanicalSiteEvidence(point, options) {
	const radius = Math.max(0.28, Math.min(0.72, Number(options.siteRadius) || 0.4));
	const shared = ecologySiteEvidenceAt(point, {
		approachMargin: 0.45,
		clearingMargin: 0.1,
		groundSampler: options.groundSampler,
		minimumNormalY: 0.7,
		roadMargin: 0.2,
		siteRadius: radius,
		waterMargin: 0.35
	});
	const district = districtClearance(point, options.district);
	const spacing = ecologySpacingClearance(
		point,
		Math.min(0.5, radius * 0.45),
		(options.occupiedPlacements || []).map(placementRecord),
		placement => placement.siteRadius
	);
	return Object.freeze({
		...shared,
		district,
		spacing,
		valid: shared.valid && district >= 0 && spacing >= 0
	});
}

function districtClearance(point, district) {
	const dx = (point.x - district.center[0]) / Math.max(1, district.radius[0]);
	const dz = (point.z - district.center[1]) / Math.max(1, district.radius[1]);
	return 1.18 - Math.hypot(dx, dz);
}

function placementRecord(placement) {
	return {
		siteRadius: Math.min(
			0.5,
			Math.max(0.25, placement.clusterRadius || 0.35) * 0.45
		),
		x: placement.position.x,
		z: placement.position.z
	};
}
