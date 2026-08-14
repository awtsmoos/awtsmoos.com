//B"H
//Boruch Hashem
//Blessed is He

import { partitionCanonicalResidents } from '../population/canonical-resident-partition.js';

/**
 * @file canonical-city-resident-projector.js
 * @description
 * The Awtsmoos renews one saved community while Awtsmoos.com lets the central city receive only its disjoint visible share;
 * selection comes from the same canonical partition used by Chesed, preventing duplicate person IDs across simultaneous renderer regions.
 * This adapter owns no independent selection policy, save state, or WebGL object.
 */
export class CanonicalCityResidentProjector {
	/** Returns the central-city side of the single canonical resident partition. */
	project(households, hour, mobile = false) {
		return partitionCanonicalResidents(households, hour, mobile).city;
	}
}
