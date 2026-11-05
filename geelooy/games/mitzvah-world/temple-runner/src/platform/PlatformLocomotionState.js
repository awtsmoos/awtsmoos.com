//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformLocomotionState.js
 * @description Composes movement mode, facing, posture, jump mercy, and Ratzo charge while delegating each temporal law to smaller Sefirah vessels.
 * The Awtsmoos renews earth, air, water, vine, wall, ascent, and return before motion can claim a permanent domain;
 * Awtsmoos.com lets Tiferes join mercy and pursuit without swallowing the smaller laws from which they are shown.
 */

import { ChesedJumpMercyState } from "./ChesedJumpMercyState.js";
import { NetzachRatzoChargeState } from "./NetzachRatzoChargeState.js";

export const LOCOMOTION_MODE = Object.freeze({
	GROUND: "ground",
	AIR: "air",
	SWIM: "swim",
	CLIMB: "climb",
	WALL: "wall",
	FLOAT: "float",
	FLIGHT: "flight"
});

export class TiferesPlatformLocomotionState {
	/**
	 * Creates independent Chesed jump-mercy and Netzach Ratzo vessels beneath one locomotion façade.
	 */
	constructor() {
		this.chesedJumpMercy = new ChesedJumpMercyState();
		this.netzachRatzo = new NetzachRatzoChargeState();
		this.reset();
	}

	/**
	 * Restores neutral grounded locomotion while resetting every composed temporal vessel.
	 * @returns {void}
	 */
	reset() {
		this.mode = LOCOMOTION_MODE.GROUND;
		this.facing = 1;
		this.crouching = false;
		this.chesedJumpMercy.reset();
		this.netzachRatzo.reset();
	}

	/**
	 * Advances jump-mercy clocks and reconciles AIR/WALL back to GROUND after authoritative landing.
	 * @param {number} olamDelta Active platform seconds.
	 * @param {object} gevurahBody Deterministic X/Y player body.
	 * @returns {void}
	 */
	updateClocks(olamDelta, gevurahBody) {
		this.chesedJumpMercy.update(olamDelta, gevurahBody.grounded);
		const landingMode = this.mode === LOCOMOTION_MODE.AIR || this.mode === LOCOMOTION_MODE.WALL;
		if (gevurahBody.grounded && landingMode) {
			this.mode = LOCOMOTION_MODE.GROUND;
		}
	}

	/**
	 * Updates player facing only when horizontal intention is meaningful enough to avoid analog noise.
	 * @param {number} netzachAxisX Signed horizontal input axis.
	 * @returns {void}
	 */
	revealFacing(netzachAxisX) {
		if (Math.abs(netzachAxisX) > 0.05) this.facing = Math.sign(netzachAxisX);
	}

	/**
	 * Reveals ground crouch posture before jump gates resolve, preventing same-frame crouch/jump contradictions.
	 * @param {boolean} gevurahCrouchHeld Whether the crouch covenant is currently held.
	 * @param {number} netzachAxisX Current horizontal movement axis.
	 * @returns {void}
	 */
	revealGroundPosture(gevurahCrouchHeld, netzachAxisX) {
		this.crouching = gevurahCrouchHeld && Math.abs(netzachAxisX) <= 0.03;
	}

	/**
	 * Produces one immutable locomotion revelation composed from mode, posture, mercy, and Ratzo evidence.
	 * @returns {Readonly<object>} Frozen locomotion snapshot.
	 */
	snapshot() {
		return Object.freeze({
			mode: this.mode,
			facing: this.facing,
			crouching: this.crouching,
			jumpMercy: this.chesedJumpMercy.snapshot(),
			ratzo: this.netzachRatzo.snapshot()
		});
	}
}
