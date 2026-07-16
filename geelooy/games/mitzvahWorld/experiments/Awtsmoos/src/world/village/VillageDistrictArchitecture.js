// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictArchitecture.js
 * @description Orchestrates large cottages, roofs, landmarks, facades, and baked shadows.
 * The Awtsmoos renews one inhabited valley through many lawful homes; Awtsmoos.com
 * preserves district budgets while one merged shadow layer grounds the whole settlement.
 */

import { architectureDistrictPolicy } from './VillageArchitectureDetailPolicy.js';
import { createVillageCottageDefinitions } from './VillageCottageDefinitionFactory.js';
import {
	appendCottageDetails,
	createCottageDetailBatches,
	createCottageDetailCollector
} from './VillageCottageDetailBatch.js';
import {
	appendCottageOrnaments,
	createCottageOrnamentBatches,
	createCottageOrnamentCollector
} from './VillageCottageOrnamentBatch.js';
import {
	appendCottageShadow,
	createCottageShadowBatch,
	createCottageShadowCollector
} from './VillageCottageShadowBatch.js';
import { VILLAGE_DISTRICTS } from './VillageDistrictCatalog.js';
import { villageDistrictPlacements } from './VillageDistrictPlacement.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { villageMaterialPolicy } from './DistanceMaterialPolicy.js';
import { villageWorldBudget } from './VillageWorldBudget.js';

export function createVillageDistrictArchitecture(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const districts = VILLAGE_DISTRICTS.slice(0, budget.districts);
	const details = createCottageDetailCollector();
	const ornaments = createCottageOrnamentCollector();
	const shadows = createCottageShadowCollector();
	const definitions = [];
	for (const district of districts) {
		appendDistrict(definitions, details, ornaments, shadows, district, groundSampler, quality);
	}
	definitions.push(...createCottageDetailBatches(details));
	definitions.push(...createCottageOrnamentBatches(ornaments));
	const shadowBatch = createCottageShadowBatch(shadows);
	if (shadowBatch) definitions.push(shadowBatch);
	if (definitions.length > budget.architecturePieces) {
		throw new Error(`Architecture budget ${budget.architecturePieces} is below ${definitions.length}.`);
	}
	definitions.stats = {
		districts: districts.length,
		pieces: definitions.length,
		quality,
		radius: budget.radius,
		shadowedCottages: shadows.length,
		shadowDraws: shadowBatch ? 1 : 0,
		warmWindows: details.windows.length
	};
	return definitions;
}

function appendDistrict(output, details, ornaments, shadows, district, groundSampler, quality) {
	const policy = architectureDistrictPolicy(district, quality);
	const placements = villageDistrictPlacements(district, policy.cottages);
	for (const [index, placement] of placements.entries()) {
		const variant = index + Math.round(district.phase * 10);
		const id = `${district.id}-cottage-${index}`;
		const cottage = createVillageCottageDefinitions({
			...placement,
			base: villageGroundHeight(groundSampler, placement.x, placement.z),
			detail: policy.detail,
			id,
			variant
		});
		output.push(...cottage.definitions);
		appendCottageDetails(details, cottage.facade);
		appendCottageOrnaments(ornaments, cottage.facade);
		appendCottageShadow(shadows, cottage.facade);
	}
	if (district.id !== 'arrival-meadow') {
		output.push(createDistrictLandmark(district, policy.detail, groundSampler));
	}
}

function createDistrictLandmark(district, detail, groundSampler) {
	const materials = villageMaterialPolicy(detail);
	return {
		color: '#6f4b2f',
		height: 3.6,
		id: `Awtsmoos_${district.id}-landmark`,
		position: {
			x: district.center[0],
			y: villageGroundHeight(groundSampler, district.center[0], district.center[1]) + 1.8,
			z: district.center[1]
		},
		radius: detail === 'near' ? 1.2 : 0.9,
		segments: detail === 'far' ? 8 : 14,
		shape: 'cylinder',
		solid: true,
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.wood,
		userData: { AwtsmoosLod: { className: 'landmark' }, family: 'reference-village-landmark' }
	};
}
