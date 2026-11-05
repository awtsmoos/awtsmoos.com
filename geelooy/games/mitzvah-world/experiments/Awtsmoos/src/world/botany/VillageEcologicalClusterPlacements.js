//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VillageEcologicalClusterPlacements.js
 * @description Orchestrates bounded ecological companions through canonical
 * botanical placement truth. The Awtsmoos joins abundance with measure;
 * Awtsmoos.com lets richer habitats bloom without escaping roads, water,
 * slope, clearing, collision, geometry, or placement budgets.
 */

import { VILLAGE_REFERENCE_DISTRICTS } from '../village/VillageReferenceComposition.js';
import { createReferenceBotanicalPlacement } from './VillageBotanicalPlacement.js';
import { villageBotanicalQuality } from './VillageBotanicalQuality.js';
import { villageEcologicalClusterPolicy } from './VillageEcologicalClusterPolicy.js';
import {
	ecologicalClusterStats,
	ecologicalCompanionAnchor,
	ecologicalCompanionSpecies,
	selectEcologicalClusterAnchors,
	stableEcologicalUnit
} from './VillageEcologicalClusterSampling.js';

const DISTRICT_BY_ID = new Map(
	VILLAGE_REFERENCE_DISTRICTS.map((district) => [district.id, district])
);

/**
 * @description Rebalances a flat botanical composition into bounded habitat clusters.
 * @param {Array<object>} basePlacements Existing canonical botanical placements.
 * @param {Function} groundSampler Canonical terrain sampling function.
 * @param {string} quality Requested world quality.
 * @returns {Array<object>} Budget-preserving clustered botanical placements.
 */
export function createVillageEcologicalClusterPlacements(
	basePlacements,
	groundSampler,
	quality = 'high'
) {
	const botanicalPolicy = villageBotanicalQuality(quality);
	const clusterPolicy = villageEcologicalClusterPolicy(quality);
	const requestedReserve = Math.floor(
		botanicalPolicy.maxPlacements * clusterPolicy.budgetFraction
	);
	const refillCapacity = clusterPolicy.maximumClusters * clusterPolicy.satellites;
	const reserve = Math.min(requestedReserve, refillCapacity);
	const retainedCount = Math.min(
		basePlacements.length,
		Math.max(0, botanicalPolicy.maxPlacements - reserve)
	);
	const output = basePlacements.slice(0, retainedCount);
	const anchors = selectEcologicalClusterAnchors(
		output,
		clusterPolicy.maximumClusters
	);
	let addedPlacements = 0;

	for (let clusterIndex = 0; clusterIndex < anchors.length; clusterIndex += 1) {
		for (let satellite = 0; satellite < clusterPolicy.satellites; satellite += 1) {
			if (output.length >= botanicalPolicy.maxPlacements) {
				break;
			}
			const placement = createCompanionPlacement({
				anchor: anchors[clusterIndex],
				clusterIndex,
				groundSampler,
				occupiedPlacements: output,
				quality,
				satellite
			});
			if (placement) {
				output.push(placement);
				addedPlacements += 1;
			}
		}
	}

	output.stats = ecologicalClusterStats(basePlacements, anchors, addedPlacements);
	return output;
}

/**
 * @description Projects one deterministic companion through canonical site validation.
 * @param {object} options Companion placement options.
 * @returns {object|null} Verified companion placement or null without a district.
 */
function createCompanionPlacement(options) {
	const district = DISTRICT_BY_ID.get(options.anchor.districtId);
	if (!district) {
		return null;
	}
	return createReferenceBotanicalPlacement({
		anchor: ecologicalCompanionAnchor(options.anchor, options.satellite),
		clusterRadius: Math.max(0.34, options.anchor.clusterRadius * 0.72),
		district,
		geometryQuality: options.anchor.geometryQuality,
		groundSampler: options.groundSampler,
		lodClass: options.anchor.lodClass,
		occupiedPlacements: options.occupiedPlacements,
		ordinal: 10000 + options.clusterIndex * 10 + options.satellite,
		requestedQuality: options.quality,
		scaleMultiplier: 0.78
			+ stableEcologicalUnit(`${options.anchor.seed}:scale`) * 0.24,
		species: ecologicalCompanionSpecies(
			options.anchor,
			options.clusterIndex,
			options.satellite
		)
	});
}
