// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiparianReedPlacement.js
 * @description Resolves deterministic riparian colonies from shared road, water, footprint, and staging truth.
 * The Awtsmoos causes many stems to reveal one living bank without blocking the human path;
 * Awtsmoos.com audits a small number of colony centers, then lets one static batch unfold abundant reeds without slowing world entry.
 */

import { ecologyOccupancyEvidenceAt } from '../spatial/WorldEcologyOccupancy.js';
import { physicalExclusionEvidenceAt } from '../spatial/WorldPhysicalExclusions.js';
import { roadCorridorEvidenceAt } from '../spatial/WorldRoadCorridor.js';
import { canonicalVillageLocationStaging } from './CanonicalVillageLocationStaging.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { sampleHydrologyAt } from './VillageRiverHydrology.js';

export const RIPARIAN_REED_CLUSTER_COUNT = 72;
export const RIPARIAN_REEDS_PER_CLUSTER = 5;
export const RIPARIAN_REED_COUNT = RIPARIAN_REED_CLUSTER_COUNT * RIPARIAN_REEDS_PER_CLUSTER;
export const RIPARIAN_CLEARING_MARGIN = 0.55;

const RIVER_STAGING = canonicalVillageLocationStaging('river-garden');
const SAMPLE_OFFSETS = Object.freeze([0, -0.012, 0.012, -0.026, 0.026, -0.045, 0.045]);
const REGIME_GROWTH = Object.freeze({
	'calm-lower-pool': 0.28,
	'fast-narrows': -0.12,
	'mountain-source': -0.18,
	'outlet-run': 0.16,
	'plunge-pool': 0.12,
	'village-current': 0.04
});

export function createRiparianReedPlacements(groundSampler, profile, options = {}) {
	const staging = options.staging || RIVER_STAGING;
	return Array.from({ length: RIPARIAN_REED_CLUSTER_COUNT }, (_, index) => (
		resolvePlacement(index, groundSampler, profile, staging)
	));
}

export function isOutsideRiparianClearings(x, z) {
	const point = { x, z };
	const road = roadCorridorEvidenceAt(point, { margin: RIPARIAN_CLEARING_MARGIN });
	const physical = physicalExclusionEvidenceAt(point, {
		margin: RIPARIAN_CLEARING_MARGIN,
		staging: RIVER_STAGING
	});
	return (!road || road.clearance >= 0) && (!physical || physical.clearance >= 0);
}

function resolvePlacement(index, groundSampler, profile, staging) {
	const baseT = (index + 0.5) / RIPARIAN_REED_CLUSTER_COUNT;
	const preferredSide = index % 2 === 0 ? 1 : -1;
	const candidates = [];
	for (const offset of SAMPLE_OFFSETS) {
		for (const side of [preferredSide, -preferredSide]) {
			const candidate = placementCandidate(index, baseT + offset, side, groundSampler, profile);
			const occupancy = ecologyOccupancyEvidenceAt(candidate, 'reed', {
				hydrology: profile,
				radius: candidate.clusterRadius,
				staging
			});
			if (occupancy.valid) candidates.push({ ...candidate, occupancy });
		}
	}
	if (!candidates.length) throw new Error(`No valid riparian reed colony for band ${index}.`);
	return candidates.sort((first, second) => second.score - first.score)[0];
}

function placementCandidate(index, t, side, groundSampler, profile) {
	const point = sampleHydrologyAt(profile, clamp(t));
	const variation = Math.sin(index * 1.73 + side * 0.61);
	const regimeGrowth = REGIME_GROWTH[point.flowRegime] || 0;
	const bankDistance = point.width + 0.42 + (1 - point.bankWetness) * 0.44 + variation * 0.14;
	const x = point.x + point.normal.x * bankDistance * side;
	const z = point.z + point.normal.z * bankDistance * side;
	const flowLean = 0.035 + point.flowSpeed * 0.035;
	return {
		bankWetness: point.bankWetness,
		clusterRadius: 0.34 + point.bankWetness * 0.18,
		flowRegime: point.flowRegime,
		height: 0.62 + point.bankWetness * 0.58 + regimeGrowth + variation * 0.07,
		leanX: -point.normal.z * flowLean + point.normal.x * variation * 0.025,
		leanZ: point.normal.x * flowLean + point.normal.z * variation * 0.025,
		score: point.bankWetness + regimeGrowth - Math.abs(point.t - clamp(t)) * 4,
		side,
		stemCount: 4 + index % 3,
		t: point.t,
		x,
		y: villageGroundHeight(groundSampler, x, z) + 0.02,
		z
	};
}

function clamp(value) {
	return Math.max(0.002, Math.min(0.998, Number(value) || 0));
}
