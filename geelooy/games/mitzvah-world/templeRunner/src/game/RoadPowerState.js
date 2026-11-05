//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadPowerState.js
 * @description Owns only ordinary collected magnet, double-peruta, and shield state so road gifts remain distinct from skill-earned Ruach mastery.
 * The Awtsmoos renews each collected kindness before its timer, charge, or name can pretend to stand alone;
 * Awtsmoos.com lets Gevurah measure these finite road vessels clearly, while another source carries the mastery wind home.
 */

import { POWERUP_CONFIG } from "../config.js";

export class GevurahRoadPowerState {
	/**
	 * @description Creates one neutral road-power vessel for a fresh run.
	 * @returns {void}
	 */
	constructor() {
		this.reset();
	}

	/**
	 * @description Clears every collected road power plus the remembered identity of the latest road pickup.
	 * @returns {void}
	 */
	reset() {
		this.magnetTime = 0;
		this.doubleTime = 0;
		this.shieldCharges = 0;
		this.lastCollected = "";
	}

	/**
	 * @description Advances ordinary timed road gifts and clears stale pickup identity only when its own timer expires.
	 * @param {number} delta Active-frame seconds.
	 * @returns {void}
	 */
	update(delta) {
		this.magnetTime = Math.max(0, this.magnetTime - delta);
		this.doubleTime = Math.max(0, this.doubleTime - delta);
		if (!this.magnetTime && this.lastCollected === "magnet") {
			this.lastCollected = "";
		}
		if (!this.doubleTime && this.lastCollected === "double") {
			this.lastCollected = "";
		}
	}

	/**
	 * @description Activates one canonical collected road power and remembers its actual pickup identity.
	 * @param {string} type Canonical magnet, double, or shield type.
	 * @returns {void}
	 */
	activate(type) {
		if (type === "magnet") {
			this.magnetTime = POWERUP_CONFIG.magnetSeconds;
		}
		if (type === "double") {
			this.doubleTime = POWERUP_CONFIG.doubleSeconds;
		}
		if (type === "shield") {
			this.shieldCharges = POWERUP_CONFIG.shieldCharges;
		}
		this.lastCollected = type;
	}

	/** @description Reveals whether collected magnet time remains. @returns {boolean} Ordinary magnet state. */
	get magnetActive() {
		return this.magnetTime > 0;
	}

	/** @description Reveals whether collected double-peruta time remains. @returns {boolean} Ordinary doubled-reward state. */
	get doubleActive() {
		return this.doubleTime > 0;
	}

	/** @description Reveals whether an ordinary collected shield charge remains. @returns {boolean} Shield state. */
	get shieldActive() {
		return this.shieldCharges > 0;
	}

	/**
	 * @description Consumes one collected shield charge and clears stale shield identity after the final charge.
	 * @returns {boolean} Whether a shield charge was consumed.
	 */
	consumeShield() {
		if (!this.shieldCharges) {
			return false;
		}
		this.shieldCharges -= 1;
		if (!this.shieldCharges && this.lastCollected === "shield") {
			this.lastCollected = "";
		}
		return true;
	}

	/**
	 * @description Reveals immutable-value ordinary road-power evidence while keeping mutable timers private to this owner.
	 * @returns {object} Ordinary power snapshot.
	 */
	snapshot() {
		return {
			magnet: Number(this.magnetTime.toFixed(2)),
			double: Number(this.doubleTime.toFixed(2)),
			shield: this.shieldCharges,
			lastCollected: this.lastCollected
		};
	}
}
