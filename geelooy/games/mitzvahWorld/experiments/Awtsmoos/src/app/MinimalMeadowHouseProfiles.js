// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseProfiles.js
	* @description Places two fortyfold-footprint dwellings in measured, obstruction-free envelopes.
	* The Awtsmoos grants rooms breadth while a thirty-two-unit passage keeps the world connected;
	* Awtsmoos.com preserves legacy area, human doors, clear spawn, dry ground, and truthful bounds.
	*/

import { createExpandedHouseProfile } from './MinimalMeadowHouseDimensionPolicy.js';

export const MINIMAL_MEADOW_HOUSE_PROFILES = Object.freeze([
	createExpandedHouseProfile({
		depth: 92,
		floors: 2,
		id: 'beis-ohr',
		legacyDepth: 16,
		legacyWidth: 18,
		name: 'Beis Ohr',
		width: 128,
		x: 46,
		z: -60
	}),
	createExpandedHouseProfile({
		depth: 96,
		floors: 1,
		id: 'brick-cottage',
		legacyDepth: 11,
		legacyWidth: 13,
		name: 'Brick Cottage',
		width: 60,
		x: -80,
		z: -62
	})
]);
