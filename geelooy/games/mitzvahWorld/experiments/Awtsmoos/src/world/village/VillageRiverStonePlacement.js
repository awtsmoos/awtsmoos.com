// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverStonePlacement.js
 * @description Places exposed wet stones by current, moisture, terrain, and village access.
 * The Awtsmoos leaves geological memory where water has reason to carry it; Awtsmoos.com
 * keeps every deposit authored, deterministic, and clear of human crossings.
 */

import { CANONICAL_VILLAGE_CLEARINGS } from './CanonicalVillagePlan.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { sampleHydrologyAt } from './VillageRiverHydrology.js';

export const RIVER_STONE_COUNT = 36;
export const RIVER_STONE_CLEARING_MARGIN = 2.2;

const SAMPLE_OFFSETS = Object.freeze([0, -0.016, 0.016, -0.034, 0.034, -0.055, 0.055]);
const CHANNEL_REGIMES = new Set(['mountain-source', 'fast-narrows', 'outlet-run']);
const REGIME_SCALE = Object.freeze({
	'calm-lower-pool': 0.18,
	'fast-narrows': -0.1,
	'mountain-source': -0.14,
	'outlet-run': 0.04,
	'plunge-pool': 0.22,
	'village-current': -0.04
});

/** Creates one bounded static placement list for the shared river-stone batch. */
export function createRiverStonePlacements(groundSampler, profile) {
	return Array.from({ length: RIVER_STONE_COUNT }, (_, index) => (
		resolvePlacement(index, groundSampler, profile)
	));
}

export function isOutsideRiverStoneClearings(x, z) {
	return CANONICAL_VILLAGE_CLEARINGS.every((clearing) => (
		Math.hypot(x - clearing.x, z - clearing.z)
		> clearing.radius + RIVER_STONE_CLEARING_MARGIN
	));
}

function resolvePlacement(index, groundSampler, profile) {
	const baseT = (index + 0.5) / RIVER_STONE_COUNT;
	const preferredSide = index % 2 === 0 ? 1 : -1;
	const candidates = [];
	for (const offset of SAMPLE_OFFSETS) {
		for (const side of candidateSides(index, preferredSide)) {
			const candidate = placementCandidate(index, baseT + offset, side, groundSampler, profile);
			if (isOutsideRiverStoneClearings(candidate.x, candidate.z)) candidates.push(candidate);
		}
	}
	if (!candidates.length) throw new Error(`No valid river stone placement for band ${index}.`);
	return candidates.sort((first, second) => second.score - first.score)[0];
}

function candidateSides(index, preferredSide) {
	return index % 5 === 0 ? [0, preferredSide, -preferredSide] : [preferredSide, -preferredSide];
}

function placementCandidate(index, t, side, groundSampler, profile) {
	const point = sampleHydrologyAt(profile, clamp(t));
	const variation = Math.sin(index * 1.83 + side * 0.67);
	const channel = side === 0 && CHANNEL_REGIMES.has(point.flowRegime);
	const effectiveSide = channel ? variation * 0.16 : side;
	const bankDistance = channel
		? point.width * 0.28
		: point.width + 0.38 + (1 - point.bankWetness) * 0.42 + variation * 0.16;
	const x = point.x + point.normal.x * bankDistance * effectiveSide;
	const z = point.z + point.normal.z * bankDistance * effectiveSide;
	const regimeScale = REGIME_SCALE[point.flowRegime] || 0;
	const width = 0.72 + point.bankWetness * 0.42 + regimeScale + variation * 0.08;
	const height = 0.38 + point.bankWetness * 0.24 + regimeScale * 0.45;
	const depth = 0.58 + point.depth * 0.24 + Math.abs(variation) * 0.09;
	const terrainY = villageGroundHeight(groundSampler, x, z);
	const exposedY = point.y - height * 0.54 + 0.04;
	return {
		bankWetness: point.bankWetness,
		channel,
		depth,
		flowRegime: point.flowRegime,
		height,
		rotation: Math.atan2(-point.normal.x, point.normal.z) + variation * 0.42,
		score: ecologicalScore(point, side, channel) - Math.abs(point.t - clamp(t)) * 3,
		side: channel ? 0 : side,
		t: point.t,
		terrainY,
		waterY: point.y,
		width,
		x,
		y: Math.max(terrainY + height * 0.16, exposedY),
		z
	};
}

function ecologicalScore(point, side, channel) {
	const channelBonus = channel && CHANNEL_REGIMES.has(point.flowRegime) ? 0.38 : 0;
	return point.bankWetness * 0.52 + point.flowSpeed * 0.08 + channelBonus + Math.abs(side) * 0.12;
}

function clamp(value) {
	return Math.max(0.002, Math.min(0.998, Number(value) || 0));
}
