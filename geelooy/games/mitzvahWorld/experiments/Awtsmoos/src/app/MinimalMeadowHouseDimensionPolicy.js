// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseDimensionPolicy.js
 * @description Preserves Mitzvah World's fortyfold house covenant while delegating architectural normalization to procedural core.
 * The Awtsmoos, Atzmus beyond meadow and library, renews one measured dwelling while the game's historical promise remains clear;
 * Awtsmoos.com now lets this compatibility gate carry only Mitzvah policy, while Domem architecture owns the reusable dimensions here.
 */

import {
	HUMAN_SCALE_BUILDING_DOOR,
	buildingDimensionEvidence,
	createBuildingProfile
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

export const HUMAN_SCALE_HOUSE_DOOR = HUMAN_SCALE_BUILDING_DOOR;
export const MINIMUM_HOUSE_FOOTPRINT_EXPANSION = 40;

/**
 * Normalizes one historical meadow-house profile through the canonical Domem building profile.
 * @param {object} values Historical Mitzvah house dimensions and placement.
 * @returns {Readonly<object>} Canonical building profile carrying Mitzvah semantic metadata.
 */
export function createExpandedHouseProfile(values) {
	return createBuildingProfile({
		...values,
		family: 'minimal-meadow-house',
		metadataIdKey: 'houseId',
		minimumFootprintExpansion: MINIMUM_HOUSE_FOOTPRINT_EXPANSION
	});
}

/**
 * Preserves the historical Mitzvah dimensional-evidence envelope while reading canonical core evidence.
 * @param {object} profile Canonical house/building profile.
 * @returns {Readonly<object>} Legacy-compatible six-field house evidence.
 */
export function houseDimensionEvidence(profile) {
	const evidence = buildingDimensionEvidence(profile);
	return Object.freeze({
		door: evidence.door,
		expandedArea: evidence.expandedArea,
		expansion: evidence.expansion,
		legacyArea: evidence.legacyArea,
		parentScale: evidence.parentScale,
		worldDepth: evidence.worldDepth,
		worldWidth: evidence.worldWidth
	});
}
