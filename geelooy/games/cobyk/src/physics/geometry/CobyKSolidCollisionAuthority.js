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
	 * Integrates one fixed-step velocity and resolves horizontal then vertical penetration against current solid snapshots.
	 * @param {object} malchusBody Mutable player body.
	 * @param {object[]} yesodSolids Static and kinetic collider snapshots.
	 * @returns {object} Immutable contact result.
	 */
	step(malchusBody, yesodSolids) {
		const netzachStep = this.gevurahRules.fixedStep;
		const binaContact = {
			grounded: false,
			ceiling: false,
			wallLeft: false,
			wallRight: false,
			supportId: null
		};
		malchusBody.x += malchusBody.vx * netzachStep;
		this.resolveHorizontal(malchusBody, yesodSolids, binaContact);
		malchusBody.y += malchusBody.vy * netzachStep;
		this.resolveVertical(malchusBody, yesodSolids, binaContact);
		return Object.freeze(binaContact);
	}

	/**
	 * Resolves horizontal penetrations according to current velocity direction and records left/right wall contact.
	 * @param {object} malchusBody Mutable player body.
	 * @param {object[]} yesodSolids Collider snapshots.
	 * @param {object} binaContact Mutable contact accumulator.
	 * @returns {void}
	 */
	resolveHorizontal(malchusBody, yesodSolids, binaContact) {
		if (malchusBody.vx === 0) return;
		for (const yesodSolid of yesodSolids) {
			if (!TiferesAabb.overlaps(malchusBody, yesodSolid)) continue;
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
