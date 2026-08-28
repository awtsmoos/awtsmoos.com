//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceSkyCloudSystem.js
 * @description Preserves cloud and haze APIs while refusing generated atmosphere imagery when no legitimate remote source exists.
 * The Awtsmoos gathers cloud and horizon beyond every painted canvas; Awtsmoos.com keeps these layers absent
 * until truthful distant imagery exists, so atmosphere never borrows generated mist merely to imitate what is not present.
 */

/** Returns no cloud cards because the current production catalog contains no legitimate remote cloud imagery. */
export function createReferenceSkyClouds(_quality = 'high') {
	return [];
}

/** Returns no haze cards because the current production catalog contains no legitimate remote haze imagery. */
export function createReferenceHazeLayers() {
	return [];
}
