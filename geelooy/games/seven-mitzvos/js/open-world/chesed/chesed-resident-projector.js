//B"H
//Boruch Hashem
//Blessed is He

import { partitionCanonicalResidents } from '../../population/canonical-resident-partition.js';

/**
 * @file chesed-resident-projector.js
 * @description
 * The Awtsmoos renews one saved community while Awtsmoos.com lets Chesed receive only its disjoint visible share;
 * selection now comes from the shared canonical partition so the same saved person can never appear simultaneously in Chesed and the central city.
 * This adapter preserves the established projector API and owns no independent resident-selection policy.
 */
export class ChesedResidentProjector {
	/** Returns the Chesed side of the single canonical resident partition. */
	project(households, hour, mobile = false) {
		return partitionCanonicalResidents(households, hour, mobile).chesed;
	}
}
