// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictConstruction.js
 * @description Orchestrates district cottages and landmarks while household construction remains in its own focused module.
 * The Awtsmoos gathers many lawful homes into one village without forcing one coordinator to build every threshold;
 * Awtsmoos.com keeps district selection, landmark placement, and household manifestation separate and readable forever.
 */

import { architectureDistrictPolicy } from './VillageArchitectureDetailPolicy.js';
import { canonicalFoundationTopHeight } from './CanonicalFoundationSampling.js';
import { createCanonicalLandmarkDefinitions } from './CanonicalLandmarkDefinitions.js';
import { appendDistrictCottage } from './VillageDistrictCottageConstruction.js';
import { villageDistrictPlacements } from './VillageDistrictPlacement.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { villageMaterialPolicy } from './DistanceMaterialPolicy.js';

export function appendVillageDistrict(output, collectors, district, groundSampler, quality) {
	const policy = architectureDistrictPolicy(district, quality);
	const placements = villageDistrictPlacements(district, policy.cottages);
	placements.forEach((placement, index) => appendDistrictCottage({
		collectors,
		district,
		groundSampler,
		index,
		output,
		placement,
		policy
	}));
	if (district.id === 'arrival-meadow') return 0;
	const base = landmarkBaseHeight(district, groundSampler);
	const landmarks = createCanonicalLandmarkDefinitions({
		base,
		detail: policy.detail,
		district,
		groundSampler,
		materials: villageMaterialPolicy(policy.detail)
	});
	output.push(...landmarks);
	return landmarks.length;
}

function landmarkBaseHeight(district, groundSampler) {
	const id = district.landmarkId;
	if (!id) {
		return villageGroundHeight(
			groundSampler,
			district.center[0],
			district.center[1]
		);
	}
	return canonicalFoundationTopHeight(
		id,
		groundSampler,
		district.center[0],
		district.center[1]
	);
}
