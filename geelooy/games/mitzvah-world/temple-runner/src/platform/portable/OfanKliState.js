//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file OfanKliState.js
 * @description Adds the original Ofan Kli retract, wake, carry compatibility, damaging slide, and horizontal ricochet cycle atop generic portable state.
 * The Awtsmoos renews wheel, stillness, collision, and awakening before a spinning vessel can claim yesterday's force as its cause;
 * Awtsmoos.com lets Gevurah give the Ofan one special lifecycle while generic carrying remains governed by broader laws.
 */

import { PORTABLE_KIND, PORTABLE_MODE } from "./PortableKind.js";
import { YesodPortableState } from "./PortableState.js";
import { revealOfanKliTraits } from "./PortableTraits.js";

const DEFAULT_OFAN_WAKE_SECONDS = 5.25;

export class GevurahOfanKliState extends YesodPortableState {
	/**
	 * Creates one dormant Ofan Kli whose carry/kick/damage capabilities come from generic portable traits.
	 * @param {{id:string,x?:number,y?:number,wakeSeconds?:number}} ofanLaw Authored Ofan covenant.
	 */
	constructor(ofanLaw) {
		super({
			id: ofanLaw.id,
			kind: PORTABLE_KIND.OFAN_KLI,
			x: ofanLaw.x,
			y: ofanLaw.y,
			mode: PORTABLE_MODE.DORMANT,
			traits: revealOfanKliTraits()
		});
		this.wakeDuration = Math.max(0.1, ofanLaw.wakeSeconds ?? DEFAULT_OFAN_WAKE_SECONDS);
		this.wakeTime = this.wakeDuration;
	}

	/**
	 * Restores authored spawn state and the full wake timer for level restart or checkpoint reconstruction.
	 * @returns {void}
	 */
	restoreOfanCycle() {
		super.reset();
		this.wakeTime = this.wakeDuration;
	}

	/**
	 * Retracts the Ofan at its current position, cancelling motion and ownership while restarting its wake countdown.
	 * This models a fresh stunned vessel without teleporting it back to authored spawn.
	 * @returns {void}
	 */
	retract() {
		this.mode = PORTABLE_MODE.DORMANT;
		this.velocityX = 0;
		this.velocityY = 0;
		this.heldBy = "";
		this.sourceId = "";
		this.ownerMercyTime = 0;
		this.wakeTime = this.wakeDuration;
	}

	/**
	 * Advances wake time only while dormant; held, thrown, kicked, or free modes preserve their active lifecycle.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {boolean} Whether the dormant Ofan awakened into FREE mode this frame.
	 */
	updateWake(olamDelta) {
		if (this.mode !== PORTABLE_MODE.DORMANT) {
			return false;
		}
		this.wakeTime = Math.max(0, this.wakeTime - Math.max(0, olamDelta));
		if (this.wakeTime > 0) {
			return false;
		}
		this.mode = PORTABLE_MODE.FREE;
		return true;
	}

	/**
	 * Reflects horizontal motion after a valid wall collision while preserving throw/kick lifecycle and vertical velocity.
	 * @returns {boolean} Whether a moving Ofan had horizontal velocity available to ricochet.
	 */
	ricochetHorizontal() {
		const moving = this.mode === PORTABLE_MODE.THROWN || this.mode === PORTABLE_MODE.KICKED;
		if (!moving || Math.abs(this.velocityX) < 0.001) {
			return false;
		}
		this.velocityX *= -1;
		return true;
	}

	/**
	 * Extends the generic immutable portable revelation with Ofan-specific wake timing evidence.
	 * @returns {Readonly<object>} Frozen portable plus wake-state snapshot.
	 */
	snapshot() {
		const portableRevelation = super.snapshot();
		return Object.freeze({
			...portableRevelation,
			wakeTime: Number(this.wakeTime.toFixed(3)),
			wakeDuration: this.wakeDuration
		});
	}
}
