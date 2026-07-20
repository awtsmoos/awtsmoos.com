// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyBankField.js
 * @description Measures every nearby river reach when raising canonical containment banks.
 * The Awtsmoos knows the higher bend and lower bend at once; Awtsmoos.com refuses to let a
 * nearest-segment shortcut bury one reach merely because another reach passes nearby in plan.
 */

import {
	CANONICAL_RIVER_POINTS,
	canonicalRiverElevation,
	canonicalRiverTerrainSample
} from './CanonicalTerrainHydrology.js';

const BANK_CLEARANCE = 0.65;
const BANK_FULL_MARGIN = 2;
const BANK_SOFT_MARGIN = 6;

/**
 * Raises terrain to satisfy every nearby canonical river bank requirement.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} terrainHeight Incoming terrain height.
 * @returns {number} Conservatively banked terrain height.
 */
export function canonicalHydrologyBankHeightAt(x, z, terrainHeight) {
	let bankedHeight = terrainHeight;
	for (let index = 1; index < CANONICAL_RIVER_POINTS.length; index += 1) {
		const first = CANONICAL_RIVER_POINTS[index - 1];
		const second = CANONICAL_RIVER_POINTS[index];
		const sample = segmentBankSample(first, second, x, z);
		if (sample.influence <= 0) {
			continue;
		}
		const candidate = raiseToAtLeast(
			terrainHeight,
			sample.targetHeight,
			sample.influence
		);
		bankedHeight = Math.max(bankedHeight, candidate);
	}
	return bankedHeight;
}

/**
 * Returns the minimum intended bank clearance above canonical water.
 *
 * @returns {number} Bank clearance in world units.
 */
export function canonicalMinimumBankClearance() {
	return BANK_CLEARANCE;
}

function segmentBankSample(first, second, x, z) {
	const projection = segmentProjection(first, second, x, z);
	const center = canonicalRiverTerrainSample(
		projection.x,
		projection.z
	);
	const influence = bankRingInfluence(
		projection.distance,
		center.width
	);
	return {
		influence,
		targetHeight: canonicalRiverElevation(center.t) + BANK_CLEARANCE
	};
}

function segmentProjection(first, second, x, z) {
	const dx = second.x - first.x;
	const dz = second.z - first.z;
	const lengthSquared = dx * dx + dz * dz || 1;
	const amount = clamp(
		((x - first.x) * dx + (z - first.z) * dz) / lengthSquared
	);
	const projectedX = first.x + dx * amount;
	const projectedZ = first.z + dz * amount;
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
	if (current >= target) {
		return current;
	}
	return mix(current, target, influence);
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
