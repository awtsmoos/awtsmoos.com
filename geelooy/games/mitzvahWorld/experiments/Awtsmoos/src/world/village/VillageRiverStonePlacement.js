// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverStonePlacement.js
 * @description Resolves deterministic channel and shoreline stone deposits from shared spatial-realism evidence.
 * The Awtsmoos leaves geological memory where living water has reason to carry it; Awtsmoos.com audits deposit centers once,
 * then lets one static batch reveal many partially submerged stones without blocking roads, homes, staging, or initial world entry.
 */

import { ecologyOccupancyEvidenceAt } from '../spatial/WorldEcologyOccupancy.js';
import { physicalExclusionEvidenceAt } from '../spatial/WorldPhysicalExclusions.js';
import { roadCorridorEvidenceAt } from '../spatial/WorldRoadCorridor.js';
import { canonicalVillageLocationStaging } from './CanonicalVillageLocationStaging.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { sampleHydrologyAt } from './VillageRiverHydrology.js';

export const RIVER_STONE_CLUSTER_COUNT = 84;
export const RIVER_STONES_PER_CLUSTER = 2;
export const RIVER_STONE_COUNT = RIVER_STONE_CLUSTER_COUNT * RIVER_STONES_PER_CLUSTER;
export const RIVER_STONE_CLEARING_MARGIN = 0.42;

const RIVER_STAGING = canonicalVillageLocationStaging('river-garden');
const SAMPLE_OFFSETS = Object.freeze([0, -0.012, 0.012, -0.027, 0.027, -0.046, 0.046]);
const CHANNEL_REGIMES = new Set(['mountain-source', 'fast-narrows', 'outlet-run']);
const REGIME_SCALE = Object.freeze({
	'calm-lower-pool': 0.16,
	'fast-narrows': -0.08,
	'mountain-source': -0.12,
	'outlet-run': 0.05,
	'plunge-pool': 0.2,
	'village-current': -0.02
});

export function createRiverStonePlacements(groundSampler, profile, options = {}) {
	const staging = options.staging || RIVER_STAGING;
	return Array.from({ length: RIVER_STONE_CLUSTER_COUNT }, (_, index) => (
		resolvePlacement(index, groundSampler, profile, staging)
	));
}

export function isOutsideRiverStoneClearings(x, z) {
	const point = { x, z };
	const road = roadCorridorEvidenceAt(point, { margin: RIVER_STONE_CLEARING_MARGIN });
	const physical = physicalExclusionEvidenceAt(point, {
		margin: RIVER_STONE_CLEARING_MARGIN,
		staging: RIVER_STAGING
	});
	return (!road || road.clearance >= 0) && (!physical || physical.clearance >= 0);
}

function resolvePlacement(index, groundSampler, profile, staging) {
	const baseT = (index + 0.5) / RIVER_STONE_CLUSTER_COUNT;
	const preferredSide = index % 2 === 0 ? 1 : -1;
	const candidates = [];
	for (const offset of SAMPLE_OFFSETS) {
		for (const side of candidateSides(index, preferredSide)) {
			const candidate = placementCandidate(index, baseT + offset, side, groundSampler, profile);
			const kind = candidate.channel ? 'stone-channel' : 'stone-bank';
			const occupancy = ecologyOccupancyEvidenceAt(candidate, kind, {
				hydrology: profile,
				radius: candidate.clusterRadius,
				staging
			});
			if (occupancy.valid) candidates.push({ ...candidate, occupancy });
		}
	}
	if (!candidates.length) throw new Error(`No valid river stone deposit for band ${index}.`);
	return candidates.sort((first, second) => second.score - first.score)[0];
}

function candidateSides(index, preferredSide) {
	return index % 4 === 0 ? [0, preferredSide, -preferredSide] : [preferredSide, -preferredSide];
}

function placementCandidate(index, t, side, groundSampler, profile) {
	const point = sampleHydrologyAt(profile, clamp(t));
	const variation = Math.sin(index * 1.83 + side * 0.67);
	const channel = side === 0 && CHANNEL_REGIMES.has(point.flowRegime);
	const effectiveSide = channel ? variation * 0.14 : side;
	const bankDistance = channel
		? point.width * 0.3
		: point.width + 0.3 + (1 - point.bankWetness) * 0.38 + variation * 0.14;
	const x = point.x + point.normal.x * bankDistance * effectiveSide;
	const z = point.z + point.normal.z * bankDistance * effectiveSide;
	const scale = REGIME_SCALE[point.flowRegime] || 0;
	const width = 0.58 + point.bankWetness * 0.36 + scale + Math.abs(variation) * 0.08;
	const height = 0.32 + point.bankWetness * 0.2 + scale * 0.4;
	const depth = 0.5 + point.depth * 0.2 + Math.abs(variation) * 0.08;
	const terrainY = villageGroundHeight(groundSampler, x, z);
	return {
		bankWetness: point.bankWetness,
		channel,
		clusterRadius: 0.36 + point.bankWetness * 0.16,
		depth,
		flowRegime: point.flowRegime,
		height,
		rotation: Math.atan2(-point.normal.x, point.normal.z) + variation * 0.38,
		score: point.bankWetness * 0.55 + point.flowSpeed * 0.08 + (channel ? 0.28 : 0.12),
		stoneCount: 1 + index % 3,
		t: point.t,
		terrainY,
		waterY: point.y,
		width,
		x,
		y: Math.max(terrainY + height * 0.14, point.y - height * 0.58 + 0.02),
		z
	};
}

function clamp(value) {
	return Math.max(0.002, Math.min(0.998, Number(value) || 0));
}
