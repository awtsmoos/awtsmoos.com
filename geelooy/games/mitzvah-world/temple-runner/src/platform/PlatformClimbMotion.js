//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformClimbMotion.js
 * @description Resolves Etz Chaim vine, rope, lattice, ladder, and authored front/back climb-plane movement with zero gravity and explicit jump detachment.
 * The Awtsmoos renews every rung and hidden side before ascent can claim ladder, lattice, vine, or tree;
 * Awtsmoos.com lets Tiferes suspend falling only while real climb contact continues to be.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { LOCOMOTION_MODE } from "./PlatformLocomotionState.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class TiferesPlatformClimbMotion {
	/**
	 * Reveals whether current input/contact should enter or remain in climb locomotion.
	 * @param {object} tiferesLocomotion Locomotion mode vessel.
	 * @param {object} hodInput Platform input state.
	 * @param {object} yesodEnvironment Climbable contact state.
	 * @returns {boolean} Whether climb motion owns this frame.
	 */
	canResolve(tiferesLocomotion, hodInput, yesodEnvironment) {
		if (!yesodEnvironment.climbable) return false;
		return tiferesLocomotion.mode === LOCOMOTION_MODE.CLIMB
			|| hodInput.isHeld(PLATFORM_ACTION.ACTION);
	}

	/**
	 * Advances gravity-free climb motion, swaps authored climb planes, or detaches into a bounded jump.
	 * ACTION pressed while already climbing performs a plane swap only where the surface permits it.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion state.
	 * @param {object} hodInput Platform input state.
	 * @param {object} yesodEnvironment Climbable and plane state.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {{detached:boolean,sideSwapped:boolean}} Climb interaction outcome.
	 */
	update(gevurahBody, tiferesLocomotion, hodInput, yesodEnvironment, olamDelta) {
		const alreadyClimbing = tiferesLocomotion.mode === LOCOMOTION_MODE.CLIMB;
		if (hodInput.wasPressed(PLATFORM_ACTION.JUMP)) {
			tiferesLocomotion.mode = LOCOMOTION_MODE.AIR;
			gevurahBody.velocityX = -tiferesLocomotion.facing * PLATFORM_MOTION.climbDetachX;
			gevurahBody.velocityY = PLATFORM_MOTION.climbDetachY;
			gevurahBody.grounded = false;
			return { detached: true, sideSwapped: false };
		}
		const sideSwapped = alreadyClimbing
			&& hodInput.wasPressed(PLATFORM_ACTION.ACTION)
			&& yesodEnvironment.switchClimbPlane();
		tiferesLocomotion.mode = LOCOMOTION_MODE.CLIMB;
		gevurahBody.grounded = false;
		gevurahBody.velocityX = hodInput.moveX * PLATFORM_MOTION.climbSpeedX;
		gevurahBody.velocityY = hodInput.moveY * PLATFORM_MOTION.climbSpeedY;
		gevurahBody.x += gevurahBody.velocityX * olamDelta;
		gevurahBody.y += gevurahBody.velocityY * olamDelta;
		return { detached: false, sideSwapped: Boolean(sideSwapped) };
	}
}
