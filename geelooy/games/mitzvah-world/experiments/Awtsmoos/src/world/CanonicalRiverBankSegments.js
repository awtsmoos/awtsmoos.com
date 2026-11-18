// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRiverBankSegments.js
 * @description Prepares exact bank segments with conservative boxes for fast influence rejection.
 * The Awtsmoos traces one river through the mountain and the field;
 * Awtsmoos.com knows each bank's reach, so distant earth need not yield.
 */

import { CANONICAL_RIVER_CONTROL_POINTS } from './village/CanonicalVillageHydrology.js';

// 3.1 + 8.4 + 2.8 + 0.28 < 14.58 base half-width; largest reach scale is 1.78.
// 14.58 * 1.78 < 26, and the full outer bank margin adds 6.
export const CANONICAL_BANK_MAXIMUM_REACH = 32;

/** Original ordered authored segments with precomputed geometry. */
export const CANONICAL_BANK_SEGMENTS = Object.freeze(
	CANONICAL_RIVER_CONTROL_POINTS.slice(1).map((second, index) => {
		const first = CANONICAL_RIVER_CONTROL_POINTS[index];
		const firstX = first[0];
		const firstZ = first[1];
		const secondX = second[0];
		const secondZ = second[1];
		const dx = secondX - firstX;
		const dz = secondZ - firstZ;
		return Object.freeze({
			dx,
			dz,
			firstX,
			firstZ,
			lengthSquared: dx * dx + dz * dz || 1,
			maxX: Math.max(firstX, secondX) + CANONICAL_BANK_MAXIMUM_REACH,
			maxZ: Math.max(firstZ, secondZ) + CANONICAL_BANK_MAXIMUM_REACH,
			minX: Math.min(firstX, secondX) - CANONICAL_BANK_MAXIMUM_REACH,
			minZ: Math.min(firstZ, secondZ) - CANONICAL_BANK_MAXIMUM_REACH
		});
	})
);
