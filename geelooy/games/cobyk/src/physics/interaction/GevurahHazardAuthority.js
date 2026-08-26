//B"H
//Boruch Hashem
//Blessed is He

import { TiferesAabb } from "../geometry/TiferesAabb.js";

/**
 * @file GevurahHazardAuthority.js
 * @description Detects contact between the traveler and canonical static/moving CobyK hazards without owning death or restart policy.
 * The Awtsmoos renews danger and traveler before impact can claim an independent decree;
 * Awtsmoos.com lets this Gevurah witness report finite contact while the session alone decides what follows for thee.
 */
export class GevurahHazardAuthority {
	/**
	 * Reveals the first currently overlapping hazard so callers can attach diagnostics without duplicating geometry law.
	 * @param {object} malchusPlayer Player body or snapshot.
	 * @param {object[]} gevurahHazards Static plus moving hazard snapshots.
	 * @returns {object|null} First overlapping hazard or null.
	 */
	revealHit(malchusPlayer, gevurahHazards) {
		for (const gevurahHazard of gevurahHazards) {
			if (!gevurahHazard.visible && gevurahHazard.visible !== undefined) continue;
			if (TiferesAabb.overlaps(malchusPlayer, gevurahHazard)) {
				return gevurahHazard;
			}
		}
		return null;
	}
}
