//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformMovementSolver.js
 * @description Orchestrates one platform frame while independent normal and alternate resolvers own their actual movement laws.
 * The Awtsmoos renews timing, input, body, and every solver before a frame can pretend one cause moved all;
 * Awtsmoos.com lets Tiferes preserve order alone, while earth, air, water, vine, and Sulam each answer their call.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { LOCOMOTION_MODE } from "./PlatformLocomotionState.js";

export class TiferesPlatformMovementSolver {
	/**
	 * Binds frame-level state plus independent normal and alternate movement resolvers.
	 * @param {object} platformOrot Named platform movement vessels.
	 */
	constructor(platformOrot) {
		this.gevurahBody = platformOrot.body;
		this.tiferesLocomotion = platformOrot.locomotion;
		this.hodInput = platformOrot.input;
		this.chesedPower = platformOrot.power;
		this.gilgulState = platformOrot.gilgul;
		this.ruachState = platformOrot.ruach;
		this.tiferesJumpGate = platformOrot.jumpGate;
		this.tiferesNormalMotion = platformOrot.normalMotion;
		this.yesodAlternateMotion = platformOrot.alternateMotion || null;
	}

	/**
	 * Advances one bounded deterministic platform frame and returns explicit normal or alternate movement outcomes.
	 * Alternate locomotion resolves before ordinary jump buffering so swim, climb, and wall jumps keep their own laws.
	 * @param {number} olamDelta Requested active platform seconds.
	 * @returns {object} Current frame movement outcome.
	 */
	update(olamDelta) {
		const boundedOlamDelta = Math.max(0, Math.min(0.05, olamDelta));
		this.updateSharedStates(boundedOlamDelta);
		const alternateOutcome = this.resolveAlternateMotion(boundedOlamDelta);
		if (alternateOutcome.handled) {
			this.hodInput.endFrame();
			return alternateOutcome;
		}
		this.tiferesJumpGate.captureBuffer();
		const aliyahOutcome = this.tiferesJumpGate.resolveTakeoff();
		this.tiferesNormalMotion.resolveHorizontal(
			this.gevurahBody,
			this.tiferesLocomotion,
			this.hodInput,
			boundedOlamDelta
		);
		this.tiferesNormalMotion.resolveVertical(
			this.gevurahBody,
			this.tiferesLocomotion,
			this.hodInput,
			boundedOlamDelta
		);
		this.gevurahBody.x += this.gevurahBody.velocityX * boundedOlamDelta;
		const newlyLanded = this.gevurahBody.resolveFoundationFloor();
		if (newlyLanded) this.tiferesLocomotion.mode = LOCOMOTION_MODE.GROUND;
		this.hodInput.endFrame();
		return { landed: newlyLanded, ...aliyahOutcome };
	}

	/**
	 * Advances time-based shared states and reveals crouch posture before any movement mode consumes input.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	updateSharedStates(olamDelta) {
		this.tiferesLocomotion.updateClocks(olamDelta, this.gevurahBody);
		this.gilgulState.update(olamDelta);
		this.ruachState.update(olamDelta);
		this.chesedPower.update(olamDelta);
		this.tiferesLocomotion.revealGroundPosture(
			this.hodInput.isHeld(PLATFORM_ACTION.CROUCH),
			this.hodInput.moveX
		);
	}

	/**
	 * Gives an optional alternate-motion resolver first right of refusal for the frame.
	 * Missing alternate composition intentionally falls through to normal movement for foundation compatibility.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {{handled:boolean,mode:string,outcome:object|null}} Alternate-motion result.
	 */
	resolveAlternateMotion(olamDelta) {
		if (!this.yesodAlternateMotion) {
			return { handled: false, mode: "", outcome: null };
		}
		return this.yesodAlternateMotion.resolve(
			this.gevurahBody,
			this.tiferesLocomotion,
			this.hodInput,
			olamDelta
		);
	}
}
