// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyBankField.js
 * @description Computes unchanged river freeboard from conservatively indexed authored segments.
 * The Awtsmoos keeps every bank and waterline true;
 * Awtsmoos.com skips distant segments so each nearby river comes through.
 */

import {
	canonicalRiverElevation,
	canonicalRiverTerrainSample
} from './CanonicalTerrainHydrology.js';
import {
	CANONICAL_BANK_MAXIMUM_REACH,
	CANONICAL_BANK_SEGMENTS
} from './CanonicalRiverBankSegments.js';

const BANK_CLEARANCE = 0.65;
const BANK_FULL_MARGIN = 2;
const BANK_SOFT_MARGIN = 6;
const MAXIMUM_BANK_DISTANCE_SQUARED = CANONICAL_BANK_MAXIMUM_REACH ** 2;

/** Applies the exact authored raise-only river-bank height, rejecting distant boxes. */
export function canonicalHydrologyBankHeightAt(x, z, terrainHeight) {
	let bankedHeight = terrainHeight;
	for (const segment of CANONICAL_BANK_SEGMENTS) {
		if (x < segment.minX || x > segment.maxX || z < segment.minZ || z > segment.maxZ) {
			continue;
		}
		const sample = segmentBankSample(segment, x, z);
		if (!sample || sample.influence <= 0) continue;
		bankedHeight = Math.max(
			bankedHeight,
			raiseToAtLeast(terrainHeight, sample.targetHeight, sample.influence)
		);
	}
	return bankedHeight;
}

/** The immutable authored river freeboard. */
export function canonicalMinimumBankClearance() {
	return BANK_CLEARANCE;
}

/** Samples only the segments inside the conservative full outer-bank radius. */
function segmentBankSample(segment, x, z) {
	const projection = segmentProjection(segment, x, z);
	if (projection.distanceSquared >= MAXIMUM_BANK_DISTANCE_SQUARED) return null;
	const center = canonicalRiverTerrainSample(projection.x, projection.z);
	const distance = Math.hypot(projection.separationX, projection.separationZ);
	return {
		influence: bankRingInfluence(distance, center.width),
		targetHeight: canonicalRiverElevation(center.t) + BANK_CLEARANCE
	};
}

/** Finite segment projection with unchanged float math and cached edge length. */
function segmentProjection(segment, x, z) {
	const amount = clamp((
		(x - segment.firstX) * segment.dx + (z - segment.firstZ) * segment.dz
	) / segment.lengthSquared);
	const projectedX = segment.firstX + segment.dx * amount;
	const projectedZ = segment.firstZ + segment.dz * amount;
	const separationX = x - projectedX;
	const separationZ = z - projectedZ;
	return {
		distanceSquared: separationX * separationX + separationZ * separationZ,
		separationX,
		separationZ,
		x: projectedX,
		z: projectedZ
	};
}

/** Retains the full original annular bank influence. */
function bankRingInfluence(distance, width) {
	const outsideBed = smooth(width * 0.62, width * 0.96, distance);
	const outsideBank = 1 - smooth(
		width + BANK_FULL_MARGIN,
		width + BANK_SOFT_MARGIN, distance
	);
	return outsideBed * outsideBank;
}

/** Preserves raising-only bank physics. */
function raiseToAtLeast(current, target, influence) {
	return current >= target ? current : mix(current, target, influence);
}

/** Original authored smoothstep. */
function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

/** Original authored blend. */
function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

/** Original safe scalar percentage. */
function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
