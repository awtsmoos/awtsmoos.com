//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformWallMotion.js
 * @description Resolves authored Sulam Prism wall-slide, wall-jump, and Ratzo wall-run behavior without granting wall powers on ordinary masonry.
 * The Awtsmoos renews every wall before resistance can claim the power to stop or raise;
 * Awtsmoos.com lets Sulam surfaces become explicit ladders of motion while ordinary stone keeps ordinary ways.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { LOCOMOTION_MODE } from "./PlatformLocomotionState.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class GevurahPlatformWallMotion {
	/**
	 * Reveals whether a real authored Sulam contact can own airborne movement this frame.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} yesodEnvironment Sulam contact state.
	 * @returns {boolean} Whether wall motion is available.
	 */
	canResolve(gevurahBody, yesodEnvironment) {
		return !gevurahBody.grounded && yesodEnvironment.sulamSide !== 0;
	}

	/**
	 * Resolves wall-jump first, Ratzo wall-run second, and readable wall-slide otherwise.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion/Ratzo state.
	 * @param {object} hodInput Platform input state.
	 * @param {object} yesodEnvironment Sulam contact state.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {{wallJump:boolean,wallRun:boolean}} Wall movement outcome.
	 */
	update(gevurahBody, tiferesLocomotion, hodInput, yesodEnvironment, olamDelta) {
		const gevurahSide = yesodEnvironment.sulamSide;
		if (hodInput.wasPressed(PLATFORM_ACTION.JUMP)) {
			tiferesLocomotion.mode = LOCOMOTION_MODE.AIR;
			gevurahBody.velocityX = -gevurahSide * PLATFORM_MOTION.wallJumpX;
			gevurahBody.velocityY = PLATFORM_MOTION.wallJumpY;
			gevurahBody.x += gevurahBody.velocityX * olamDelta;
			gevurahBody.y += gevurahBody.velocityY * olamDelta;
			return { wallJump: true, wallRun: false };
		}
		const pressingTowardWall = Math.sign(hodInput.moveX) === gevurahSide;
		const wallRun = yesodEnvironment.sulamRun
			&& tiferesLocomotion.netzachRatzo.charged
			&& hodInput.isHeld(PLATFORM_ACTION.RUN)
			&& pressingTowardWall;
		tiferesLocomotion.mode = LOCOMOTION_MODE.WALL;
		gevurahBody.velocityY = wallRun
			? PLATFORM_MOTION.wallRunSpeed
			: Math.max(gevurahBody.velocityY, -PLATFORM_MOTION.wallSlideSpeed);
		gevurahBody.velocityX = 0;
		gevurahBody.y += gevurahBody.velocityY * olamDelta;
		return { wallJump: false, wallRun };
	}
}
