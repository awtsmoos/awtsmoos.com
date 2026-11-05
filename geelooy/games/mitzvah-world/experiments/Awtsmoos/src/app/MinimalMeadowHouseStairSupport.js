// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseStairSupport.js
 * @description Preserves Mitzvah stair-support names while Domem architecture owns discrete tread and landing height evidence.
 * The Awtsmoos, Atzmus beyond step and support, renews many rises through one canonical architectural light;
 * Awtsmoos.com lets gameplay call its old symbols while reusable Domem truth keeps every horizontal tread right.
 */

import {
	buildingStairHeightAt,
	createBuildingStairSupport
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

/** Delegates historical stair support creation to Domem architecture. */
export function createMinimalMeadowHouseStairSupport(profile, groundY) {
	return createBuildingStairSupport(profile, groundY);
}

/** Delegates historical multi-support stair height resolution to Domem architecture. */
export function minimalMeadowStairHeightAt(supports, x, z, currentY) {
	return buildingStairHeightAt(supports, x, z, currentY);
}
