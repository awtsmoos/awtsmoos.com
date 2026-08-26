//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformMovementSolver.js
 * @description Coordinates normal ground/air motion while delegating water, climb, and Sulam-wall frames to one alternate-motion resolver.
 * The Awtsmoos renews every subsystem before a frame can pretend the player is moved by one cause;
 * Awtsmoos.com lets Tiferes join many lights while each alternate world law remains inside its own house.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { LOCOMOTION_MODE } from "./PlatformLocomotionState.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class TiferesPlatformMovementSolver {
	/**
	 * Binds every renderer-free movement dependency explicitly so architecture remains visible to readers and tests.
	 * @param {object} platformOrot Named platform movement vessels.
	 */
	constructor(platformOrot) {
		this.gevurahBody = platformOrot.body;
		this.tiferesLocomotion = platformOrot.locomotion;
		this.hodInput = platformOrot.input;
		this.chesedPower = platformOrot.power;
		this.gilgulState = platformOrot.gilgul;
		this.mantleState = platformOrot.mantle;
		this.ruachState = platformOrot.ruach;
		this.netzachGroundMotion = platformOrot.ground;
		this.hodAirMotion = platformOrot.air;
		this.tiferesJumpGate = platformOrot.jumpGate;
		this.yesodAlternateMotion = platformOrot.alternateMotion || null;
	}

	/**
	 * Advances one bounded deterministic platform frame and returns explicit normal or alternate movement outcomes.
	 * Alternate locomotion resolves before ordinary jump buffering so swim, climb, and wall jumps retain their own laws.
	 * @param {number} olamDelta Requested active platform seconds.
	 * @returns {object} Current frame movement outcome.
	 */
	update(olamDelta) {
		const boundedOlamDelta = Math.max(0, Math.min(0.05, olamDelta));
		this.tiferesLocomotion.updateClocks(boundedOlamDelta, this.gevurahBody);
		this.gilgulState.update(boundedOlamDelta);
		this.ruachState.update(boundedOlamDelta);
		this.chesedPower.update(boundedOlamDelta);
		this.tiferesLocomotion.revealGroundPosture(
			this.hodInput.isHeld(PLATFORM_ACTION.CROUCH),
			this.hodInput.moveX
		);
		const alternateOutcome = this.resolveAlternateMotion(boundedOlamDelta);
		if (alternateOutcome.handled) {
			this.hodInput.endFrame();
			return alternateOutcome;
		}
		this.tiferesJumpGate.captureBuffer();
		const aliyahOutcome = this.tiferesJumpGate.resolveTakeoff();
		this.resolveHorizontalMotion(boundedOlamDelta);
		this.resolveVerticalMotion(boundedOlamDelta);
		this.gevurahBody.x += this.gevurahBody.velocityX * boundedOlamDelta;
		const newlyLanded = this.gevurahBody.resolveFoundationFloor();
		if (newlyLanded) this.tiferesLocomotion.mode = LOCOMOTION_MODE.GROUND;
		this.hodInput.endFrame();
		return { landed: newlyLanded, ...aliyahOutcome };
	}

	/**
	 * Gives an optional alternate-motion resolver first right of refusal for the active frame.
	 * Missing alternate composition intentionally falls through to normal ground/air behavior for backward compatibility.
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

	/**
	 * Delegates normal-mode horizontal movement to ground acceleration or bounded aerial steering.
	 * Airborne frames also drain Ratzo gradually so launch mastery has hysteresis without becoming permanent.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	resolveHorizontalMotion(olamDelta) {
		if (this.gevurahBody.grounded) {
			this.netzachGroundMotion.update(
				this.gevurahBody,
				this.tiferesLocomotion,
				this.hodInput,
				olamDelta
			);
			return;
		}
		this.hodAirMotion.steer(this.gevurahBody, this.hodInput, olamDelta);
		this.tiferesLocomotion.netzachRatzo.update(
			false,
			Math.abs(this.gevurahBody.velocityX),
			olamDelta
		);
	}

	/**
	 * Delegates normal airborne Y integration through Mantle and temporary Ruach gravity laws.
	 * Grounded or alternate-locomotion frames never pass through this method.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	resolveVerticalMotion(olamDelta) {
		if (this.gevurahBody.grounded) return;
		const mantleLaw = this.mantleState.revealAirLaw(
			this.gevurahBody,
			this.tiferesLocomotion,
			this.chesedPower,
			this.hodInput
		);
		this.hodAirMotion.fall(this.gevurahBody, this.hodInput, olamDelta, {
			gravityScale: this.ruachState.active
				? PLATFORM_MOTION.ruachGravityScale
				: mantleLaw.gravityScale,
			fallLimit: mantleLaw.fallLimit
		});
	}
}
