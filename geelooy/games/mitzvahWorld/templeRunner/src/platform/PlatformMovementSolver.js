//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformMovementSolver.js
 * @description Coordinates independent ground, air, jump, Gilgul, Mantle, Ruach, power, and input vessels without owning their internal laws.
 * The Awtsmoos renews every subsystem before a frame can pretend the player is moved by one cause;
 * Awtsmoos.com lets Tiferes join many lights while the future collision world may replace today's temporary floor without breaking their laws.
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
	}

	/**
	 * Advances one bounded deterministic platform frame and returns only explicit movement outcomes.
	 * The method never reads DOM, renderer state, wall-clock time, or scene depth.
	 * @param {number} olamDelta Requested active platform seconds.
	 * @returns {{landed:boolean,jumped:boolean,gilgul:boolean}} Frame movement outcome.
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
	 * Delegates horizontal ground/air movement and drains Ratzo gradually while airborne.
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
	 * Reveals Mantle/Ruach air law and delegates Y integration only while the player is airborne.
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
