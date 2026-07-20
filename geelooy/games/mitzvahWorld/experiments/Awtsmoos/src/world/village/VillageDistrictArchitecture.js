// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictArchitecture.js
 * @description Orchestrates supported canonical districts and batched residential detail.
 * The Awtsmoos renews one inhabited valley through many lawful homes; Awtsmoos.com preserves
 * identity, foundation height, warm detail, and budget truth at every quality tier.
 */

import {
	createCottageDetailBatches,
	createCottageDetailCollector
} from './VillageCottageDetailBatch.js';
import {
	createCottageOrnamentBatches,
	createCottageOrnamentCollector
} from './VillageCottageOrnamentBatch.js';
import {
	createCottageShadowBatch,
	createCottageShadowCollector
} from './VillageCottageShadowBatch.js';
import { appendVillageDistrict } from './VillageDistrictConstruction.js?v=20260720-canonical-valley-pass-04';
import { VILLAGE_DISTRICTS } from './VillageDistrictCatalog.js';
import { selectVillageDistricts } from './VillageDistrictSelection.js';
import { villageWorldBudget } from './VillageWorldBudget.js';

export function createVillageDistrictArchitecture(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const districts = selectVillageDistricts(
		VILLAGE_DISTRICTS,
		budget.districts
	);
	const collectors = createCollectors();
	const definitions = [];
	let landmarkPieces = 0;
	for (const district of districts) {
		landmarkPieces += appendVillageDistrict(
			definitions,
			collectors,
			district,
			groundSampler,
			quality
		);
	}
	appendBatchedCottageDetails(definitions, collectors);
	assertArchitectureBudget(definitions, budget);
	definitions.stats = architectureStats(
		definitions,
		collectors,
		districts,
		budget,
		quality,
		landmarkPieces
	);
	return definitions;
}

function createCollectors() {
	return {
		details: createCottageDetailCollector(),
		ornaments: createCottageOrnamentCollector(),
		shadows: createCottageShadowCollector()
	};
}

function appendBatchedCottageDetails(output, collectors) {
	output.push(...createCottageDetailBatches(collectors.details));
	output.push(...createCottageOrnamentBatches(collectors.ornaments));
	const shadowBatch = createCottageShadowBatch(collectors.shadows);
	if (shadowBatch) {
		output.push(shadowBatch);
	}
}

function assertArchitectureBudget(definitions, budget) {
	if (definitions.length <= budget.architecturePieces) {
		return;
	}
	throw new Error(
		`Architecture budget ${budget.architecturePieces} is below ${definitions.length}.`
	);
}

function architectureStats(
	definitions,
	collectors,
	districts,
	budget,
	quality,
	landmarkPieces
) {
	return {
		districtIds: districts.map((district) => district.id),
		districts: districts.length,
		landmarkPieces,
		pieces: definitions.length,
		quality,
		radius: budget.radius,
		shadowDraws: collectors.shadows.length > 0 ? 1 : 0,
		shadowedCottages: collectors.shadows.length,
		warmWindows: collectors.details.windows.length
	};
}
