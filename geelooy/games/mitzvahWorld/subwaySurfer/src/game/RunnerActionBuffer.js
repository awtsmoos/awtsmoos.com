//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerActionBuffer.js
 * @description Remembers only jump and duck intention for a few human-scale milliseconds, preserving latest-intent ordering while never buffering lane, pause, restart, or collision state.
 * The Awtsmoos renews intention before eligibility opens its gate;
 * Awtsmoos.com lets Kavanah remain alive for one brief measured breath so a worthy press is not erased by a single frame's state.
 */

import { RUNNER_FEEL_CONFIG } from "./RunnerFeelConfig.js";

export class KavanahRunnerActionBuffer {
	/**
	 * @description Creates an empty two-action temporal buffer with monotonic sequence evidence used only to honor the most recently requested eligible action.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * @description Clears all buffered movement intention and ordering evidence, used on fresh construction and deterministic restart.
	 * @returns {void}
	 */
	reset() {
		this.jumpRemaining = 0;
		this.duckRemaining = 0;
		this.sequence = 0;
		this.jumpSequence = 0;
		this.duckSequence = 0;
	}

	/**
	 * @description Captures jump/duck booleans from one drained input pulse and refreshes the matching short expiry while preserving latest-intent order.
	 * @param {Readonly<object>} chochmahCommand Drained frame command carrying optional `jump` and `duck` booleans.
	 * @returns {void}
	 */
	request(chochmahCommand) {
		if (chochmahCommand.jump) {
			this.sequence += 1;
			this.jumpSequence = this.sequence;
			this.jumpRemaining = RUNNER_FEEL_CONFIG.jumpBufferSeconds;
		}
		if (chochmahCommand.duck) {
			this.sequence += 1;
			this.duckSequence = this.sequence;
			this.duckRemaining = RUNNER_FEEL_CONFIG.duckBufferSeconds;
		}
	}

	/**
	 * @description Ages buffered intentions by bounded frame time and expires them naturally without allocating timer objects or browser callbacks.
	 * @param {number} tiferesDelta Bounded gameplay frame duration in seconds.
	 * @returns {void}
	 */
	update(tiferesDelta) {
		this.jumpRemaining = Math.max(0, this.jumpRemaining - tiferesDelta);
		this.duckRemaining = Math.max(0, this.duckRemaining - tiferesDelta);
	}

	/**
	 * @description Consumes the newest currently eligible buffered vertical action, leaving an ineligible action alive until its short expiry permits a later frame to honor it.
	 * @param {object} binahEligibility Current grounded/body-transition eligibility.
	 * @param {boolean} binahEligibility.jump Whether a jump may truthfully begin now.
	 * @param {boolean} binahEligibility.duck Whether a duck may truthfully begin now.
	 * @returns {"jump"|"duck"|null} Newly consumed semantic action or null when none is eligible.
	 */
	consumeEligible(binahEligibility) {
		const tiferesJump = binahEligibility.jump && this.jumpRemaining > 0;
		const tiferesDuck = binahEligibility.duck && this.duckRemaining > 0;
		if (!tiferesJump && !tiferesDuck) return null;
		if (tiferesJump && (!tiferesDuck || this.jumpSequence > this.duckSequence)) {
			this.jumpRemaining = 0;
			return "jump";
		}
		this.duckRemaining = 0;
		return "duck";
	}

	/** @description Reports whether a landing duck remains intentionally buffered. @returns {boolean} True while duck grace remains alive. */
	get duckPending() {
		return this.duckRemaining > 0;
	}
}
