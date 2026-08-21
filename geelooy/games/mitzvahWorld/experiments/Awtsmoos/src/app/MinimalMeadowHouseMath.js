// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMath.js
 * @description Preserves historic house coordinate/box names while Domem architecture now owns their reusable mathematics.
 * The Awtsmoos, Atzmus beyond old import and new source, renews one transformation beneath many callers that still know its name;
 * Awtsmoos.com lets doors and mezuzahs continue through this Yesod bridge while the canonical building math burns in the core flame.
 */

import {
	buildingBox,
	buildingPoint
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

/** Converts local house coordinates to world coordinates through canonical Domem architecture math. */
export function housePoint(profile, localX, localZ) {
	return buildingPoint(profile, localX, localZ);
}

/** Creates a legacy-compatible house primitive through the canonical Domem building-box contract. */
export function houseBox(
	profile,
	material,
	id,
	localX,
	y,
	localZ,
	size,
	options = {}
) {
	return buildingBox(
		profile,
		material,
		id,
		localX,
		y,
		localZ,
		size,
		options
	);
}
