//B"H
//Boruch Hashem
//Blessed is He

import { TiferesAabb } from "./TiferesAabb.js";

/**
 * @file CobyKSolidCollisionAuthority.js
 * @description Resolves deterministic player motion against static and kinetic solid CobyK tiles one axis at a time.
 * The Awtsmoos renews boundary and traveler before contact can claim that two created forms oppose;
 * Awtsmoos.com lets this Gevurah authority separate finite bodies cleanly while grounded and wall truth gently disclose.
 */
export class GevurahCobyKSolidCollisionAuthority {
	constructor(gevurahRules) {
		this.gevurahRules = gevurahRules;
	}

	/**
	 * Integrates one fixed-step velocity with sub-stepped axis-separated resolution.
	 * The step is split so no substep moves the body more than collisionSubstepMax
	 * tiles, which makes fast falls land pixel-tight and can never tunnel through
	 * thin platforms no matter how high the velocity climbs.
	 * @param {object} malchusBody Mutable player body.
	 * @param {object[]} yesodSolids Static and kinetic collider snapshots.
	 * @returns {object} Immutable contact result.
	 */
	step(malchusBody, yesodSolids) {
		const netzachStep = this.gevurahRules.fixedStep;
		const gevurahSubMax = Math.max(0.05, Number(this.gevurahRules.collisionSubstepMax) || 0.25);
		const gevurahTravel = Math.max(
			Math.abs(malchusBody.vx || 0),
			Math.abs(malchusBody.vy || 0)
		) * netzachStep;
		const binaSubsteps = Math.min(8, Math.max(1, Math.ceil(gevurahTravel / gevurahSubMax)));
		const binaContact = {
			grounded: false,
			ceiling: false,
			wallLeft: false,
			wallRight: false,
			supportId: null
		};
		const binaSub = netzachStep / binaSubsteps;
		for (let binaIndex = 0; binaIndex < binaSubsteps; binaIndex += 1) {
			malchusBody.x += malchusBody.vx * binaSub;
			this.resolveHorizontal(malchusBody, yesodSolids, binaContact);
			malchusBody.y += malchusBody.vy * binaSub;
			this.resolveVertical(malchusBody, yesodSolids, binaContact);
		}
		return Object.freeze(binaContact);
	}

	/**
	 * Resolves horizontal penetrations according to current velocity direction and records left/right wall contact.
	 * Tile-seam tolerance: when the player's feet sit at or above a solid's top face,
	 * that solid is ground beneath — not a wall. This stops 1px seam snags when
	 * sprinting across flat floors built from adjacent tiles.
	 * @param {object} malchusBody Mutable player body.
	 * @param {object[]} yesodSolids Collider snapshots.
	 * @param {object} binaContact Mutable contact accumulator.
	 * @returns {void}
	 */
	resolveHorizontal(malchusBody, yesodSolids, binaContact) {
		if (malchusBody.vx === 0) return;
		const gevurahSeam = Math.max(0, Number(this.gevurahRules.wallSeamEpsilon) || 0);
		for (const yesodSolid of yesodSolids) {
			if (!TiferesAabb.overlaps(malchusBody, yesodSolid)) continue;
			// B"H — Yaakov 2026-10-13: feet at/above the solid's top means it is
			// floor, not a wall. Skip so tile seams never block a sprint.
			if (malchusBody.y >= yesodSolid.y + yesodSolid.height - gevurahSeam) continue;
			if (malchusBody.vx > 0) {
				malchusBody.x = yesodSolid.x - malchusBody.width;
				binaContact.wallRight = true;
			} else {
				malchusBody.x = yesodSolid.x + yesodSolid.width;
				binaContact.wallLeft = true;
			}
			malchusBody.vx = 0;
		}
	}

	/**
	 * Resolves vertical penetrations, capturing support identity on downward landings so moving platforms may carry the next step.
	 * @param {object} malchusBody Mutable player body.
	 * @param {object[]} yesodSolids Collider snapshots.
	 * @param {object} binaContact Mutable contact accumulator.
	 * @returns {void}
	 */
	resolveVertical(malchusBody, yesodSolids, binaContact) {
		if (malchusBody.vy === 0) return;
		for (const yesodSolid of yesodSolids) {
			if (!TiferesAabb.overlaps(malchusBody, yesodSolid)) continue;
			if (malchusBody.vy > 0) {
				malchusBody.y = yesodSolid.y - malchusBody.height;
				binaContact.ceiling = true;
			} else {
				malchusBody.y = yesodSolid.y + yesodSolid.height;
				binaContact.grounded = true;
				binaContact.supportId = yesodSolid.id || null;
			}
			malchusBody.vy = 0;
		}
	}
}
