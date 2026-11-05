//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformSwimMotion.js
 * @description Resolves buoyant free swimming, directional strokes, drag, and authored water currents without importing ground or air physics.
 * The Awtsmoos renews every drop before current, swimmer, or stroke can claim the sea;
 * Awtsmoos.com lets Chesed soften gravity into flowing motion while each Mayim vector remains deterministic and free.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { LOCOMOTION_MODE } from "./PlatformLocomotionState.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class ChesedPlatformSwimMotion {
	/**
	 * Creates one swim solver with an empty stroke cooldown.
	 */
	constructor() {
		this.strokeTime = 0;
	}

	/**
	 * Advances aquatic motion while the player remains inside a water volume.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion mode vessel.
	 * @param {object} hodInput Platform input state.
	 * @param {object} yesodEnvironment Water/current contact state.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {{stroke:boolean}} Whether a fresh upward swim stroke fired.
	 */
	update(gevurahBody, tiferesLocomotion, hodInput, yesodEnvironment, olamDelta) {
		tiferesLocomotion.mode = LOCOMOTION_MODE.SWIM;
		gevurahBody.grounded = false;
		this.strokeTime = Math.max(0, this.strokeTime - olamDelta);
		const stroke = hodInput.wasPressed(PLATFORM_ACTION.JUMP) && this.strokeTime <= 0;
		if (stroke) {
			gevurahBody.velocityY = Math.max(gevurahBody.velocityY, PLATFORM_MOTION.swimStrokeVelocity);
			this.strokeTime = PLATFORM_MOTION.swimStrokeCooldown;
		}
		gevurahBody.velocityX += (hodInput.moveX * PLATFORM_MOTION.swimAcceleration + yesodEnvironment.currentX) * olamDelta;
		gevurahBody.velocityY += (hodInput.moveY * PLATFORM_MOTION.swimAcceleration + yesodEnvironment.currentY) * olamDelta;
		const dragRatio = Math.max(0, 1 - PLATFORM_MOTION.swimDrag * olamDelta);
		gevurahBody.velocityX *= dragRatio;
		gevurahBody.velocityY *= dragRatio;
		gevurahBody.velocityX = Math.max(-PLATFORM_MOTION.swimMaxSpeedX, Math.min(PLATFORM_MOTION.swimMaxSpeedX, gevurahBody.velocityX));
		gevurahBody.velocityY = Math.max(-PLATFORM_MOTION.swimMaxSpeedY, Math.min(PLATFORM_MOTION.swimMaxSpeedY, gevurahBody.velocityY));
		gevurahBody.x += gevurahBody.velocityX * olamDelta;
		gevurahBody.y += gevurahBody.velocityY * olamDelta;
		return { stroke };
	}
}
