//B"H
//Boruch Hashem
//Blessed is He

import { TiferesAabb } from "../geometry/TiferesAabb.js";

/**
 * @file NetzachForceAuthority.js
 * @description Preserves CobyK directional-arrow behavior by applying authored force vectors as explicit player velocity commands.
 * The Awtsmoos renews direction and momentum before an arrow can claim to push by its own might;
 * Awtsmoos.com lets this Netzach authority translate finite symbols into measured velocity while the traveler remains held in light.
 */
export class NetzachForceAuthority {
	constructor(gevurahRules) {
		this.gevurahRules = gevurahRules;
	}

	/**
	 * Applies the first overlapping directional force exactly like the original rule: vector components set corresponding velocity directly.
	 * @param {object} malchusPlayer Mutable player body.
	 * @param {object[]} netzachForces Parsed directional-force entities.
	 * @returns {object|null} Applied force entity or null.
	 */
	apply(malchusPlayer, netzachForces) {
		for (const netzachForce of netzachForces) {
			if (!TiferesAabb.overlaps(malchusPlayer, netzachForce)) continue;
			const [netzachX, netzachY] = netzachForce.force || [0, 0];
			if (netzachX !== 0) {
				malchusPlayer.vx = netzachX * this.gevurahRules.forceSpeed;
			}
			if (netzachY !== 0) {
				malchusPlayer.vy = netzachY * this.gevurahRules.forceSpeed;
				if (netzachY > 0) malchusPlayer.grounded = false;
			}
			return netzachForce;
		}
		return null;
	}
}
