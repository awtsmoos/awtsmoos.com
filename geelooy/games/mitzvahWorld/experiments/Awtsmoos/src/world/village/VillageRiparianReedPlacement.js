// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiparianReedPlacement.js
 * @description Resolves terrain-rooted reeds from moisture, current, and village access.
 * The Awtsmoos joins water and earth without obstructing the human crossing; Awtsmoos.com
 * keeps every stem deterministic, ecologically measured, and dormant after world creation.
 */

import { CANONICAL_VILLAGE_CLEARINGS } from './CanonicalVillagePlan.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { sampleHydrologyAt } from './VillageRiverHydrology.js';

export const RIPARIAN_REED_COUNT = 64;
export const RIPARIAN_CLEARING_MARGIN = 1.4;

const SAMPLE_OFFSETS = Object.freeze([0, -0.012, 0.012, -0.026, 0.026, -0.045, 0.045]);
const REGIME_GROWTH = Object.freeze({
	'calm-lower-pool': 0.28,
	'fast-narrows': -0.12,
	'mountain-source': -0.18,
	'outlet-run': 0.16,
	'plunge-pool': 0.12,
	'village-current': 0.04
});

/**
 * Creates a bounded static placement list for one shared reed geometry batch.
 *
 * @param {Function|object} groundSampler - Canonical village ground sampler.
 * @param {{points: Array<object>}} profile - Resolved source-to-outlet hydrology.
 * @returns {Array<object>} Deterministic riparian placement metadata.
 */
export function createRiparianReedPlacements(groundSampler, profile) {
	return Array.from({ length: RIPARIAN_REED_COUNT }, (_, index) => (
		resolvePlacement(index, groundSampler, profile)
	));
}

export function isOutsideRiparianClearings(x, z) {
	return CANONICAL_VILLAGE_CLEARINGS.every((clearing) => (
		Math.hypot(x - clearing.x, z - clearing.z)
		> clearing.radius + RIPARIAN_CLEARING_MARGIN
	));
}

function resolvePlacement(index, groundSampler, profile) {
	const baseT = (index + 0.5) / RIPARIAN_REED_COUNT;
	const preferredSide = index % 2 === 0 ? 1 : -1;
	const candidates = [];
	for (const offset of SAMPLE_OFFSETS) {
		for (const side of [preferredSide, -preferredSide]) {
			const candidate = placementCandidate(index, baseT + offset, side, groundSampler, profile);
			if (isOutsideRiparianClearings(candidate.x, candidate.z)) candidates.push(candidate);
		}
	}
	if (!candidates.length) throw new Error(`No valid riparian reed placement for band ${index}.`);
	return candidates.sort((first, second) => second.score - first.score)[0];
}

function placementCandidate(index, t, side, groundSampler, profile) {
	const point = sampleHydrologyAt(profile, clamp(t));
	const variation = Math.sin(index * 1.73 + side * 0.61);
	const regimeGrowth = REGIME_GROWTH[point.flowRegime] || 0;
	const bankDistance = point.width + 0.5 + (1 - point.bankWetness) * 0.52 + variation * 0.18;
	const x = point.x + point.normal.x * bankDistance * side;
	const z = point.z + point.normal.z * bankDistance * side;
	const flowLean = 0.035 + point.flowSpeed * 0.035;
	return {
		bankDistance,
		bankWetness: point.bankWetness,
		flowRegime: point.flowRegime,
		height: 0.56 + point.bankWetness * 0.52 + regimeGrowth + variation * 0.07,
		leanX: -point.normal.z * flowLean + point.normal.x * variation * 0.025,
		leanZ: point.normal.x * flowLean + point.normal.z * variation * 0.025,
		score: point.bankWetness + regimeGrowth - Math.abs(point.t - clamp(t)) * 4,
		side,
		t: point.t,
		x,
		y: villageGroundHeight(groundSampler, x, z) + 0.025,
		z
	};
}

function clamp(value) {
	return Math.max(0.002, Math.min(0.998, Number(value) || 0));
}
