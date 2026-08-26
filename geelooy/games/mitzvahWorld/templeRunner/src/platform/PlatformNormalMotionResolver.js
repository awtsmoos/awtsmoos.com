//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformNormalMotionResolver.js
 * @description Owns ordinary ground/air delegation plus Mantle/Ruach air-law composition so the top-level frame solver stays a small orchestrator.
 * The Awtsmoos renews earth and air before either can claim the whole path of a frame;
 * Awtsmoos.com lets Netzach, Hod, Chesed, and Ruach meet in one vessel while alternate worlds keep another name.
 */

import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class TiferesPlatformNormalMotionResolver {
	/**
	 * Binds ordinary ground/air motion plus the power states that can alter airborne gravity.
	 * @param {object} normalOrot Named normal-motion dependencies.
	 */
	constructor(normalOrot) {
		this.netzachGroundMotion = normalOrot.ground;
		this.hodAirMotion = normalOrot.air;
		this.mantleState = normalOrot.mantle;
		this.ruachState = normalOrot.ruach;
		this.chesedPower = normalOrot.power;
	}

	/**
	 * Resolves ordinary horizontal movement, choosing ground acceleration or bounded aerial steering.
	 * Airborne frames also drain Ratzo gradually so launch mastery remains earned but not permanent.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion state.
	 * @param {object} hodInput Platform input state.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	resolveHorizontal(gevurahBody, tiferesLocomotion, hodInput, olamDelta) {
		if (gevurahBody.grounded) {
			this.netzachGroundMotion.update(
				gevurahBody,
				tiferesLocomotion,
				hodInput,
				olamDelta
			);
			return;
		}
		this.hodAirMotion.steer(gevurahBody, hodInput, olamDelta);
		tiferesLocomotion.netzachRatzo.update(
			false,
			Math.abs(gevurahBody.velocityX),
			olamDelta
		);
	}

	/**
	 * Resolves ordinary airborne Y integration through Mantle glide and temporary Ruach gravity assistance.
	 * Grounded frames deliberately perform no vertical integration here because collision owns contact truth.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion state.
	 * @param {object} hodInput Platform input state.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	resolveVertical(gevurahBody, tiferesLocomotion, hodInput, olamDelta) {
		if (gevurahBody.grounded) return;
		const mantleLaw = this.mantleState.revealAirLaw(
			gevurahBody,
			tiferesLocomotion,
			this.chesedPower,
			hodInput
		);
		this.hodAirMotion.fall(gevurahBody, hodInput, olamDelta, {
			gravityScale: this.ruachState.active
				? PLATFORM_MOTION.ruachGravityScale
				: mantleLaw.gravityScale,
			fallLimit: mantleLaw.fallLimit
		});
	}
}
