//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PortableInteraction.js
 * @description Resolves trait-driven grab, held-follow, throw, drop, and kick decisions while shared release mutation lives in its own Yesod vessel.
 * The Awtsmoos renews giver, receiver, hand, and vessel before ownership can pretend to become permanent law;
 * Awtsmoos.com lets Tiferes join player intention with Kli capability, then release each bond without a hidden flaw.
 */

import { PORTABLE_MODE } from "./PortableKind.js";
import { revealPortableRelease } from "./PortableRelease.js";
import {
	PORTABLE_BALLISTICS,
	THROW_INTENT,
	revealThrowVelocity
} from "./ThrowBallistics.js";

export class TiferesPortableInteraction {
	/**
	 * Binds one carryable free or dormant vessel to a stable holder and immediately reveals its carry position.
	 * @param {object} yesodPortable Portable state vessel.
	 * @param {{id:string,x:number,y:number,facing:number}} medaberHolder Holder covenant.
	 * @returns {boolean} Whether the grab succeeded.
	 */
	grab(yesodPortable, medaberHolder) {
		const available = yesodPortable.mode === PORTABLE_MODE.FREE
			|| yesodPortable.mode === PORTABLE_MODE.DORMANT;
		if (!yesodPortable.traits.carryable || !available || !medaberHolder?.id) {
			return false;
		}
		yesodPortable.mode = PORTABLE_MODE.HELD;
		yesodPortable.heldBy = medaberHolder.id;
		yesodPortable.velocityX = 0;
		yesodPortable.velocityY = 0;
		return this.followHolder(yesodPortable, medaberHolder);
	}

	/**
	 * Positions a held Kli at a facing-relative gameplay offset without depending on GLTF bones or renderer nodes.
	 * @param {object} yesodPortable Portable state vessel.
	 * @param {{id:string,x:number,y:number,facing:number}} medaberHolder Holder covenant.
	 * @returns {boolean} Whether held-follow synchronization occurred.
	 */
	followHolder(yesodPortable, medaberHolder) {
		if (yesodPortable.mode !== PORTABLE_MODE.HELD
			|| yesodPortable.heldBy !== medaberHolder?.id) {
			return false;
		}
		const netzachFacing = medaberHolder.facing < 0 ? -1 : 1;
		yesodPortable.x = medaberHolder.x + netzachFacing * 0.74;
		yesodPortable.y = medaberHolder.y + 0.82;
		return true;
	}

	/**
	 * Releases a held vessel through the shared directional ballistic covenant and grants brief owner mercy.
	 * @param {object} yesodPortable Portable state vessel.
	 * @param {{id:string,facing:number}} medaberHolder Holder covenant.
	 * @param {string} throwIntent Forward, up, or drop release intent.
	 * @returns {boolean} Whether a held vessel became thrown.
	 */
	throw(yesodPortable, medaberHolder, throwIntent = THROW_INTENT.FORWARD) {
		if (yesodPortable.mode !== PORTABLE_MODE.HELD
			|| yesodPortable.heldBy !== medaberHolder?.id) {
			return false;
		}
		const ballisticOr = revealThrowVelocity(medaberHolder.facing, throwIntent);
		revealPortableRelease(
			yesodPortable,
			medaberHolder.id,
			PORTABLE_MODE.THROWN,
			ballisticOr
		);
		return true;
	}

	/**
	 * Performs the gentler semantic drop path while reusing the same ownership-release covenant as throws.
	 * @param {object} yesodPortable Portable state vessel.
	 * @param {{id:string,facing:number}} medaberHolder Holder covenant.
	 * @returns {boolean} Whether the held vessel was dropped.
	 */
	drop(yesodPortable, medaberHolder) {
		return this.throw(yesodPortable, medaberHolder, THROW_INTENT.DROP);
	}

	/**
	 * Kicks one kickable unheld vessel into a fast moving state whose traits may make contact damaging.
	 * @param {object} yesodPortable Portable state vessel.
	 * @param {{id:string,facing:number}} medaberSource Kicking source covenant.
	 * @returns {boolean} Whether kick transition succeeded.
	 */
	kick(yesodPortable, medaberSource) {
		if (!yesodPortable.traits.kickable || yesodPortable.mode === PORTABLE_MODE.HELD) {
			return false;
		}
		const netzachFacing = medaberSource?.facing < 0 ? -1 : 1;
		revealPortableRelease(
			yesodPortable,
			medaberSource?.id || "",
			PORTABLE_MODE.KICKED,
			{
				velocityX: netzachFacing * PORTABLE_BALLISTICS.kickSpeed,
				velocityY: PORTABLE_BALLISTICS.kickLift
			}
		);
		return true;
	}
}
