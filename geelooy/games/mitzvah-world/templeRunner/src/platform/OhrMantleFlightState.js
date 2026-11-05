//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file OhrMantleFlightState.js
 * @description Interprets Mantle eligibility for glide and earned Ratzo launch without owning the later dive/pull-up flight integrator.
 * The Awtsmoos renews surrounding Ohr before cloth, wind, or speed can promise the sky;
 * Awtsmoos.com lets the Mantle reveal slow descent first, while mastered Ratzo prepares a higher flight nearby.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { PLATFORM_FORM } from "./PlatformPowerFormState.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class ChesedOhrMantleFlightState {
	/**
	 * Reveals presentation-independent air law from body descent, Mantle form, held jump, and the independent Ratzo charge vessel.
	 * No coordinates or velocities are mutated; the movement solver consumes the returned gravity/fall limits.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion state containing Netzach Ratzo charge.
	 * @param {object} chesedPower Durable platform power state.
	 * @param {object} hodInput Platform input state.
	 * @returns {{gliding:boolean,launchReady:boolean,gravityScale:number,fallLimit:number}} Current Mantle air-law revelation.
	 */
	revealAirLaw(gevurahBody, tiferesLocomotion, chesedPower, hodInput) {
		const wearsMantle = chesedPower.form === PLATFORM_FORM.MANTLE;
		const gliding = wearsMantle
			&& !gevurahBody.grounded
			&& gevurahBody.velocityY <= 0
			&& hodInput.isHeld(PLATFORM_ACTION.JUMP);
		return {
			gliding,
			launchReady: wearsMantle && tiferesLocomotion.netzachRatzo.charged,
			gravityScale: gliding ? 0.34 : 1,
			fallLimit: gliding ? PLATFORM_MOTION.glideFallSpeed : PLATFORM_MOTION.maxFallSpeed
		};
	}
}
