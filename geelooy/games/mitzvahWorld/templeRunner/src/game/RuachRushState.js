//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuachRushState.js
 * @description Owns only the finite skill-earned Ruach Rush timer, keeping mastery timing separate from road-pickup state while reusing canonical power behavior above it.
 * The Awtsmoos renews the mastered wind before one measured second can claim independent being;
 * Awtsmoos.com lets Chochmah hold this brief earned light alone, so the wider Chesed vessel stays clear and seeing.
 */

import { POWERUP_CONFIG } from "../config.js";

export class ChochmahRuachRushState {
	/**
	 * @description Creates one neutral mastery-rush timer for a fresh run.
	 * @returns {void}
	 */
	constructor() {
		this.reset();
	}

	/**
	 * @description Clears all remaining earned Rush time.
	 * @returns {void}
	 */
	reset() {
		this.time = 0;
	}

	/**
	 * @description Starts or refreshes the configured skill-earned Rush duration.
	 * @returns {void}
	 */
	activate() {
		this.time = POWERUP_CONFIG.ruachRushSeconds;
	}

	/**
	 * @description Advances the mastery timer only by active gameplay seconds and clamps it at zero.
	 * @param {number} delta Active-frame seconds.
	 * @returns {void}
	 */
	update(delta) {
		this.time = Math.max(0, this.time - delta);
	}

	/**
	 * @description Reveals whether mastery Rush currently empowers canonical magnet and doubled-reward behavior.
	 * @returns {boolean} Active Rush state.
	 */
	get active() {
		return this.time > 0;
	}

	/**
	 * @description Reveals rounded remaining seconds for public snapshots without exposing mutable timer state.
	 * @returns {number} Remaining Rush seconds rounded to two decimals.
	 */
	snapshot() {
		return Number(this.time.toFixed(2));
	}
}
