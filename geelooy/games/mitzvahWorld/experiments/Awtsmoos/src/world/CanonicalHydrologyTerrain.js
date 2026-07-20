// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyTerrain.js
 * @description Cuts the nearest river bed after raising every nearby containment bank.
 * The Awtsmoos lets water descend without vanishing beneath earth; Awtsmoos.com honors the
 * higher neighboring reach at tight bends while preserving one finite bed for the nearest flow.
 */

import {
	canonicalHydrologyBankHeightAt,
	canonicalMinimumBankClearance
} from './CanonicalHydrologyBankField.js';
import {
	canonicalRiverElevation,
	canonicalRiverTerrainSample
} from './CanonicalTerrainHydrology.js';

const BED_DEPTH = 1.35;

/**
 * Applies canonical bank and bed constraints to an existing terrain height.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} terrainHeight Incoming terrain height.
 * @returns {number} Hydrology-constrained terrain height.
 */
export function canonicalHydrologyTerrainHeightAt(x, z, terrainHeight) {
	const bankedHeight = canonicalHydrologyBankHeightAt(
		x,
		z,
		terrainHeight
	);
	const river = canonicalRiverTerrainSample(x, z);
	const waterHeight = canonicalRiverElevation(river.t);
	const bedTarget = waterHeight - BED_DEPTH;
	const bedInfluence = 1 - smooth(
		river.width * 0.44,
		river.width * 0.88,
		river.distance
	);
	return mix(bankedHeight, bedTarget, bedInfluence);
}

export { canonicalMinimumBankClearance };

/**
 * Returns the intended bed depth below canonical water.
 *
 * @returns {number} Bed depth in world units.
 */
export function canonicalRiverBedDepth() {
	return BED_DEPTH;
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
