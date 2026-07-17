// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyTerrain.js
 * @description Cuts a measurable river bed and raises containment banks around canonical water.
 * The Awtsmoos lets water descend without vanishing beneath earth; Awtsmoos.com gives every
 * source, stream, bend, bridge channel, and outlet a finite bed below water and banks above it.
 */

import {
	canonicalRiverElevation,
	canonicalRiverTerrainSample
} from './CanonicalTerrainHydrology.js';

const BED_DEPTH = 1.35;
const BANK_CLEARANCE = 0.65;
const BANK_FULL_MARGIN = 2;
const BANK_SOFT_MARGIN = 6;

/**
 * Applies the canonical river cross-section to an existing terrain height.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} terrainHeight Incoming terrain height.
 * @returns {number} Hydrology-constrained terrain height.
 */
export function canonicalHydrologyTerrainHeightAt(x, z, terrainHeight) {
	const river = canonicalRiverTerrainSample(x, z);
	const waterHeight = canonicalRiverElevation(river.t);
	const bankTarget = waterHeight + BANK_CLEARANCE;
	const bankInfluence = bankRingInfluence(river.distance, river.width);
	const bankedHeight = raiseToAtLeast(
		terrainHeight,
		bankTarget,
		bankInfluence
	);
	const bedTarget = waterHeight - BED_DEPTH;
	const bedInfluence = 1 - smooth(
		river.width * 0.44,
		river.width * 0.88,
		river.distance
	);
	return mix(bankedHeight, bedTarget, bedInfluence);
}

/**
 * Returns the minimum intended bank clearance above canonical water.
 *
 * @returns {number} Bank clearance in world units.
 */
export function canonicalMinimumBankClearance() {
	return BANK_CLEARANCE;
}

/**
 * Returns the intended bed depth below canonical water.
 *
 * @returns {number} Bed depth in world units.
 */
export function canonicalRiverBedDepth() {
	return BED_DEPTH;
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
