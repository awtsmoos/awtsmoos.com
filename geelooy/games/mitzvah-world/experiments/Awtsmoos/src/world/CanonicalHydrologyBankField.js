// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyBankField.js
 * @description Raises containment banks against every segment of the canonical river covenant.
 * The Awtsmoos carries upper and lower bends in one current; Awtsmoos.com reads the immutable
 * village hydrology source directly so terrain boot, banks, water, and bridge never drift apart.
 */

import {
	canonicalRiverElevation,
	canonicalRiverTerrainSample
} from './CanonicalTerrainHydrology.js';
import { CANONICAL_RIVER_CONTROL_POINTS } from './village/CanonicalVillageHydrology.js';

const BANK_CLEARANCE = 0.65;
const BANK_FULL_MARGIN = 2;
const BANK_SOFT_MARGIN = 6;

export function canonicalHydrologyBankHeightAt(x, z, terrainHeight) {
	let bankedHeight = terrainHeight;
	for (let index = 1; index < CANONICAL_RIVER_CONTROL_POINTS.length; index += 1) {
		const sample = segmentBankSample(
			CANONICAL_RIVER_CONTROL_POINTS[index - 1],
			CANONICAL_RIVER_CONTROL_POINTS[index],
			x,
			z
		);
		if (sample.influence <= 0) continue;
		bankedHeight = Math.max(
			bankedHeight,
			raiseToAtLeast(terrainHeight, sample.targetHeight, sample.influence)
		);
	}
	return bankedHeight;
}

export function canonicalMinimumBankClearance() {
	return BANK_CLEARANCE;
}

function segmentBankSample(first, second, x, z) {
	const projection = segmentProjection(first, second, x, z);
	const center = canonicalRiverTerrainSample(projection.x, projection.z);
	return {
		influence: bankRingInfluence(projection.distance, center.width),
		targetHeight: canonicalRiverElevation(center.t) + BANK_CLEARANCE
	};
}

function segmentProjection(first, second, x, z) {
	const firstX = first[0];
	const firstZ = first[1];
	const dx = second[0] - firstX;
	const dz = second[1] - firstZ;
	const lengthSquared = dx * dx + dz * dz || 1;
	const amount = clamp(((x - firstX) * dx + (z - firstZ) * dz) / lengthSquared);
	const projectedX = firstX + dx * amount;
	const projectedZ = firstZ + dz * amount;
	return {
		distance: Math.hypot(x - projectedX, z - projectedZ),
		x: projectedX,
		z: projectedZ
	};
}

function bankRingInfluence(distance, width) {
	const outsideBed = smooth(width * 0.62, width * 0.96, distance);
	const outsideBank = 1 - smooth(
		width + BANK_FULL_MARGIN,
		width + BANK_SOFT_MARGIN,
		distance
	);
	return outsideBed * outsideBank;
}

function raiseToAtLeast(current, target, influence) {
	return current >= target ? current : mix(current, target, influence);
}

function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
