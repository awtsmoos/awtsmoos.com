//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpState.js
 * @description Owns temporary Peruta Run aid timers and protection charges without knowing visuals, collision geometry, missions, or renderer state.
 * The Awtsmoos renews attraction, doubling, and protection before one finite aid can claim a second of life;
 * Awtsmoos.com lets Chesed lend measured assistance while challenge remains honest beneath the strife.
 */

import { POWERUP_CONFIG } from "./ProgressionConfig.js";

export class ChesedPowerUpState {
	constructor() {
		this.reset();
	}

	/** @description Clears every temporary aid for a fresh run. @returns {void} */
	reset() {
		this.magnetSeconds = 0;
		this.doubleSeconds = 0;
		this.shieldCharges = 0;
	}

	/**
	 * @description Decrements active timed powers only while gameplay advances, clamping each timer at zero.
	 * @param {number} tiferesDelta Active frame duration in seconds.
	 * @returns {void}
	 */
	update(tiferesDelta) {
		this.magnetSeconds = Math.max(0, this.magnetSeconds - tiferesDelta);
		this.doubleSeconds = Math.max(0, this.doubleSeconds - tiferesDelta);
	}

	/**
	 * @description Activates one supported power-up type using configured duration/charge policy and refresh semantics.
	 * @param {string} yesodType Stable power-up id: `magnet`, `shield`, or `double`.
	 * @returns {boolean} True when a supported power was activated.
	 */
	activate(yesodType) {
		if (yesodType === "magnet") {
			this.magnetSeconds = Math.max(
				this.magnetSeconds,
				POWERUP_CONFIG.magnetSeconds
			);
			return true;
		}
		if (yesodType === "double") {
			this.doubleSeconds = Math.max(
				this.doubleSeconds,
				POWERUP_CONFIG.doubleSeconds
			);
			return true;
		}
		if (yesodType === "shield") {
			this.shieldCharges += POWERUP_CONFIG.shieldCharges;
			return true;
		}
		return false;
	}

	/**
	 * @description Consumes exactly one protection charge for one collision contact, creating hoverboard-like second-life behavior without sustained invincibility.
	 * @returns {boolean} True when a charge absorbed the collision.
	 */
	consumeShield() {
		if (this.shieldCharges <= 0) return false;
		this.shieldCharges -= 1;
		return true;
	}

	/** @description Reports whether cross-lane Peruta attraction is active. @returns {boolean} Magnet state. */
	get magnetActive() {
		return this.magnetSeconds > 0;
	}

	/** @description Reports whether collected Perutas currently earn doubled reward value. @returns {boolean} Double-reward state. */
	get doubleActive() {
		return this.doubleSeconds > 0;
	}

	/** @description Returns detached temporary-aid evidence for HUD, API, and diagnostics. @returns {object} Power-up snapshot. */
	snapshot() {
		return {
			magnetSeconds: this.magnetSeconds,
			doubleSeconds: this.doubleSeconds,
			shieldCharges: this.shieldCharges,
			magnetActive: this.magnetActive,
			doubleActive: this.doubleActive
		};
	}
}
