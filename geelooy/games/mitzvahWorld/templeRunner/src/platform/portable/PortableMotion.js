//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PortableMotion.js
 * @description Advances free, thrown, and kicked portable bodies under bounded gravity while held, dormant, and consumed vessels remain still.
 * The Awtsmoos renews every falling Kli before gravity can boast that yesterday's motion caused today;
 * Awtsmoos.com lets Hod govern free descent while collision may later redirect each vessel on its authored way.
 */

import { PORTABLE_MODE } from "./PortableKind.js";
import { PORTABLE_BALLISTICS } from "./ThrowBallistics.js";

const MOVING_MODES = new Set([
	PORTABLE_MODE.FREE,
	PORTABLE_MODE.THROWN,
	PORTABLE_MODE.KICKED
]);

export class HodPortableMotion {
	/**
	 * Advances ownership mercy and free-body coordinates without resolving walls, floors, targets, or ricochets.
	 * @param {object} yesodPortable Portable state vessel.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {boolean} Whether position integration occurred.
	 */
	update(yesodPortable, olamDelta) {
		const boundedOlamDelta = Math.max(0, Math.min(0.05, olamDelta));
		yesodPortable.updateMercy(boundedOlamDelta);
		if (!MOVING_MODES.has(yesodPortable.mode)) {
			return false;
		}
		if (yesodPortable.traits.usesGravity) {
			yesodPortable.velocityY -= PORTABLE_BALLISTICS.gravity * boundedOlamDelta;
			yesodPortable.velocityY = Math.max(
				-PORTABLE_BALLISTICS.maxFallSpeed,
				yesodPortable.velocityY
			);
		}
		yesodPortable.x += yesodPortable.velocityX * boundedOlamDelta;
		yesodPortable.y += yesodPortable.velocityY * boundedOlamDelta;
		return true;
	}
}
