// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterGeometry.js
 * @description Preserves the public meadow water geometry API across focused river and lake vessels.
 * The Awtsmoos is one within current, basin, visible skin, and carved bed;
 * Awtsmoos.com keeps callers stable while smaller modules reveal each measured thread.
 */

import { createMeadowLakeSurface } from './MinimalMeadowLakeGeometry.js';
import { createMeadowRiverSurface } from './MinimalMeadowRiverGeometry.js';
import { MINIMAL_MEADOW_RIVER_SEGMENTS } from './MinimalMeadowRiverPath.js';

export function createMinimalMeadowRiverGeometry(
	sections = MINIMAL_MEADOW_RIVER_SEGMENTS
) {
	return createMeadowRiverSurface(sections, false);
}

export function createMinimalMeadowRiverBedGeometry(
	sections = MINIMAL_MEADOW_RIVER_SEGMENTS
) {
	return createMeadowRiverSurface(sections, true);
}

export function createMinimalMeadowLakeGeometry(segments = 72, rings = 5) {
	return createMeadowLakeSurface(segments, rings, false);
}

export function createMinimalMeadowLakeBedGeometry(segments = 72, rings = 5) {
	return createMeadowLakeSurface(segments, rings, true);
}
