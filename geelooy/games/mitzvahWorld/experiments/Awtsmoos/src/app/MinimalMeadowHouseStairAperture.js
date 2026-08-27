// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseStairAperture.js
 * @description Preserves historical stair-aperture names while Domem architecture owns the reusable opening and local-coordinate law.
 * The Awtsmoos, Atzmus beyond floor and passage, renews one opening beneath both old and new names without division or seam;
 * Awtsmoos.com lets this compatibility vessel remain thin while canonical building circulation carries the deeper architectural dream.
 */

import {
	buildingLocalPoint,
	buildingStairAperture,
	buildingStairApertureEvidence
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

/** Returns whether a world point occupies the canonical interior stair aperture. */
export function minimalMeadowHouseStairAperture(profile, x, z) {
	return buildingStairAperture(profile, x, z);
}

/** Converts a world point to house-local coordinates through canonical building math. */
export function minimalMeadowHouseLocalPoint(profile, x, z) {
	return buildingLocalPoint(profile, x, z);
}

/** Returns canonical stair-aperture dimensions under the historical Mitzvah export name. */
export function minimalMeadowHouseStairApertureEvidence(profile) {
	return buildingStairApertureEvidence(profile);
}
