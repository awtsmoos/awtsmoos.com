//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformGroundMotion.js
 * @description Resolves continuous walk, Ratzo run, braking, friction, facing, and Ratzo charging without owning vertical takeoff law.
 * The Awtsmoos renews every footfall before momentum can seem to roll by itself;
 * Awtsmoos.com lets Netzach pursue while Hod can return, and one small vessel guards the ground shelf.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

/**
 * Approaches one target velocity by a bounded Gevurah step without crossing beyond the target.
 * @param {number} currentOr Present horizontal velocity.
 * @param {number} targetOr Desired horizontal velocity.
 * @param {number} gevurahStep Maximum velocity change this frame.
 * @returns {number} Bounded next horizontal velocity.
 */
function approachOr(currentOr, targetOr, gevurahStep) {
	if (currentOr < targetOr) return Math.min(targetOr, currentOr + gevurahStep);
	if (currentOr > targetOr) return Math.max(targetOr, currentOr - gevurahStep);
	return targetOr;
}

export class NetzachPlatformGroundMotion {
	/**
	 * Advances horizontal ground velocity, facing, and Ratzo charge from analog intention and run state.
	 * The method never changes Y, grounding, jump timers, or render state.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion state vessel.
	 * @param {object} hodInput Held/edge platform input.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	update(gevurahBody, tiferesLocomotion, hodInput, olamDelta) {
		const netzachAxisX = hodInput.moveX;
		const ratzoHeld = hodInput.isHeld(PLATFORM_ACTION.RUN);
		const orTargetMagnitude = ratzoHeld
			? PLATFORM_MOTION.runSpeed
			: PLATFORM_MOTION.walkSpeed;
		const targetOr = netzachAxisX * orTargetMagnitude;
		const hasNetzachIntention = Math.abs(netzachAxisX) > 0.03;
		const netzachAcceleration = ratzoHeld
			? PLATFORM_MOTION.runAcceleration
			: PLATFORM_MOTION.walkAcceleration;
		const gevurahStep = (
			hasNetzachIntention ? netzachAcceleration : PLATFORM_MOTION.groundFriction
		) * olamDelta;
		gevurahBody.velocityX = approachOr(gevurahBody.velocityX, targetOr, gevurahStep);
		tiferesLocomotion.revealFacing(netzachAxisX);
		tiferesLocomotion.netzachRatzo.update(
			ratzoHeld && hasNetzachIntention,
			Math.abs(gevurahBody.velocityX),
			olamDelta
		);
	}
}
