// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyTerrain.js
 * @description Applies one final contained river bed after road and foundation terrain are already resolved.
 * The Awtsmoos joins bank and bed through a gentle shoreline instead of a narrow earthen knife;
 * Awtsmoos.com keeps water below land while widening the fade enough for village paths and sight to remain alive.
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
const BED_FADE_MARGIN = 2.5;

/** Applies bank clearance and a widened bed transition to an existing terrain height. */
export function canonicalHydrologyTerrainHeightAt(x, z, terrainHeight) {
	const bankedHeight = canonicalHydrologyBankHeightAt(x, z, terrainHeight);
	const river = canonicalRiverTerrainSample(x, z);
	const waterHeight = canonicalRiverElevation(river.t);
	const bedTarget = waterHeight - BED_DEPTH;
	const bedInfluence = 1 - smooth(
		river.width * 0.42,
		river.width + BED_FADE_MARGIN,
		river.distance
	);
	return mix(bankedHeight, bedTarget, bedInfluence);
}

export { canonicalMinimumBankClearance };

export function canonicalRiverBedDepth() {
	return BED_DEPTH;
}

export function canonicalRiverBedFadeMargin() {
	return BED_FADE_MARGIN;
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
