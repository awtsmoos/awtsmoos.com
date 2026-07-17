// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictConstruction.js
 * @description Places canonical cottages and landmarks upon measured generated envelopes.
 * The Awtsmoos joins house, hill, and road without forcing one to erase another; Awtsmoos.com
 * raises every named structure from its full room-scale footprint while infill follows local ground.
 */

import { architectureDistrictPolicy } from './VillageArchitectureDetailPolicy.js';
import { canonicalFoundationTopHeight } from './CanonicalFoundationSampling.js';
import { createCanonicalLandmarkDefinitions } from './CanonicalLandmarkDefinitions.js';
import { createVillageCottageDefinitions } from './VillageCottageDefinitionFactory.js';
import { appendCottageDetails } from './VillageCottageDetailBatch.js';
import { appendCottageOrnaments } from './VillageCottageOrnamentBatch.js';
import { villageCottageScalePolicy } from './VillageCottageScalePolicy.js';
import { appendCottageShadow } from './VillageCottageShadowBatch.js';
import { villageDistrictPlacements } from './VillageDistrictPlacement.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { villageMaterialPolicy } from './DistanceMaterialPolicy.js';

export function appendVillageDistrict(
	output,
	collectors,
	district,
	groundSampler,
	quality
) {
	const policy = architectureDistrictPolicy(district, quality);
	const placements = villageDistrictPlacements(district, policy.cottages);
	placements.forEach((placement, index) => {
		appendCottage(
			output,
			collectors,
			district,
			placement,
			policy,
			groundSampler,
			index
		);
	});
	if (district.id === 'arrival-meadow') {
		return 0;
	}
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

function appendCottage(
	output,
	collectors,
	district,
	placement,
	policy,
	groundSampler,
	index
) {
	const variant = index + Math.round(district.phase * 10);
	const id = placement.houseId || `${district.id}-cottage-${index}`;
	const scale = villageCottageScalePolicy(policy.detail, variant);
	const base = canonicalFoundationTopHeight(
		id,
		groundSampler,
		placement.x,
		placement.z,
		cottageEnvelope(placement, scale)
	);
	const cottage = createVillageCottageDefinitions({
		...placement,
		base,
		detail: policy.detail,
		id,
		variant
	});
	output.push(...cottage.definitions);
	appendCottageDetails(collectors.details, cottage.facade);
	appendCottageOrnaments(collectors.ornaments, cottage.facade);
	appendCottageShadow(collectors.shadows, cottage.facade);
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

function cottageEnvelope(placement, scale) {
	return {
		depth: scale.depth,
		width: scale.width,
		x: placement.x,
		yaw: placement.yaw,
		z: placement.z
	};
}
