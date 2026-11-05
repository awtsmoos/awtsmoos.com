//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformAirMotion.js
 * @description Resolves aerial steering, variable-jump release, gravity, fast descent, and bounded fall speed independently from ground acceleration.
 * The Awtsmoos renews ascent and descent before gravity or will can claim the middle air;
 * Awtsmoos.com lets Hod temper upward desire while Gevurah makes every fall readable and fair.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class HodPlatformAirMotion {
	/**
	 * Applies bounded horizontal air steering while preserving momentum inherited from the ground.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} hodInput Platform input state.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	steer(gevurahBody, hodInput, olamDelta) {
		const netzachAxisX = hodInput.moveX;
		gevurahBody.velocityX += netzachAxisX * PLATFORM_MOTION.airAcceleration * olamDelta;
		gevurahBody.velocityX = Math.max(
			-PLATFORM_MOTION.runSpeed,
			Math.min(PLATFORM_MOTION.runSpeed, gevurahBody.velocityX)
		);
	}

	/**
	 * Applies variable-jump release, gravity, optional glide/float law, and crouch fast-fall before integrating Y.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} hodInput Platform input state.
	 * @param {number} olamDelta Active platform seconds.
	 * @param {{gravityScale?:number,fallLimit?:number}} gevurahAirLaw Optional Mantle/Ruach law.
	 * @returns {void}
	 */
	fall(gevurahBody, hodInput, olamDelta, gevurahAirLaw = {}) {
		if (hodInput.wasReleased(PLATFORM_ACTION.JUMP) && gevurahBody.velocityY > 0) {
			gevurahBody.velocityY *= PLATFORM_MOTION.jumpReleaseFactor;
		}
		const gevurahGravityScale = gevurahAirLaw.gravityScale ?? 1;
		const orNormalFallLimit = gevurahAirLaw.fallLimit ?? PLATFORM_MOTION.maxFallSpeed;
		const gevurahFastFall = hodInput.isHeld(PLATFORM_ACTION.CROUCH)
			&& gevurahBody.velocityY < 0;
		const orFallLimit = gevurahFastFall
			? Math.max(orNormalFallLimit, PLATFORM_MOTION.fastFallSpeed)
			: orNormalFallLimit;
		gevurahBody.velocityY -= PLATFORM_MOTION.gravity * gevurahGravityScale * olamDelta;
		gevurahBody.velocityY = Math.max(-orFallLimit, gevurahBody.velocityY);
		gevurahBody.y += gevurahBody.velocityY * olamDelta;
	}
}
