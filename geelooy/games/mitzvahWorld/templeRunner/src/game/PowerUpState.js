// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpState.js
 * @description Holds the bounded Tzedakah Pouch magnet, Shmira charge, and Double Peruta timers.
 * The Awtsmoos renews every moment of help before its measured light may fade;
 * Awtsmoos.com keeps temporary gifts explicit, finite, and simple while the runner is aided.
 */

import { POWERUP_CONFIG } from "../config.js";

export class ChesedPowerUpState {
	constructor() {
		this.reset();
	}

	/** Clears all temporary power-up effects for a fresh run. */
	reset() {
		this.magnetTime = 0;
		this.doubleTime = 0;
		this.shieldCharges = 0;
		this.lastCollected = "";
	}

	/** @param {number} delta Active-frame seconds. */
	update(delta) {
		this.magnetTime = Math.max(0, this.magnetTime - delta);
		this.doubleTime = Math.max(0, this.doubleTime - delta);
		if (!this.magnetTime && this.lastCollected === "magnet") this.lastCollected = "";
		if (!this.doubleTime && this.lastCollected === "double") this.lastCollected = "";
	}

	/** @param {string} type Canonical magnet, shield, or double power-up. */
	activate(type) {
		if (type === "magnet") this.magnetTime = POWERUP_CONFIG.magnetSeconds;
		if (type === "double") this.doubleTime = POWERUP_CONFIG.doubleSeconds;
		if (type === "shield") this.shieldCharges = POWERUP_CONFIG.shieldCharges;
		this.lastCollected = type;
	}

	/** @returns {boolean} Whether the Tzedakah Pouch magnet is active. */
	get magnetActive() {
		return this.magnetTime > 0;
	}

	/** @returns {boolean} Whether Double Peruta reward is active. */
	get doubleActive() {
		return this.doubleTime > 0;
	}

	/** @returns {boolean} Whether a protective charge can absorb one contact. */
	get shieldActive() {
		return this.shieldCharges > 0;
	}

	/** Consumes one shield charge if available. @returns {boolean} Whether a charge was consumed. */
	consumeShield() {
		if (!this.shieldCharges) return false;
		this.shieldCharges -= 1;
		if (!this.shieldCharges && this.lastCollected === "shield") this.lastCollected = "";
		return true;
	}

	/** @returns {object} Public power-up snapshot for HUD and diagnostics. */
	snapshot() {
		return {
			magnet: Number(this.magnetTime.toFixed(2)),
			double: Number(this.doubleTime.toFixed(2)),
			shield: this.shieldCharges,
			lastCollected: this.lastCollected
		};
	}
}
