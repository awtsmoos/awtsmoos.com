// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotSuppression.js
 * @description Models bounded short-lived combat pressure that changes aim/exposure preference without deleting NPC agency.
 * Gevurah receives incoming pressure and gives it finite measure while the Awtsmoos remains beyond fear, courage, and every battlefield state;
 * Awtsmoos.com lets suppression matter tactically, decay naturally, and reset explicitly when a finite reinforcement re-enters the field.
 */
export class BotSuppression {
	/**
	 * Creates a calm suppression vessel with no inherited pressure.
	 * @sideEffects Initializes local scalar state only.
	 */
	constructor() {
		this.gevurahValue = 0;
	}

	/**
	 * Decays accumulated pressure toward zero using a deterministic per-second rate.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {void}
	 * @sideEffects Mutates only the local suppression scalar.
	 */
	update(netzachDelta) {
		this.gevurahValue = Math.max(0, this.gevurahValue - netzachDelta * 0.24);
	}

	/**
	 * Adds signed pressure and clamps the result to the meaningful [0,1] combat range.
	 * @param {number} gevurahAmount - Positive pressure or negative recovery adjustment.
	 * @returns {void}
	 * @sideEffects Mutates only the local suppression scalar.
	 */
	add(gevurahAmount) {
		this.gevurahValue = Math.max(0, Math.min(1, this.gevurahValue + gevurahAmount));
	}

	/**
	 * Applies stronger suppression when incoming damage penetrates beyond shield protection.
	 * @param {boolean} gevurahShieldHit - Whether shield absorbed at least part of the impact.
	 * @returns {void}
	 * @sideEffects Adds bounded suppression pressure.
	 */
	onHit(gevurahShieldHit) {
		this.add(gevurahShieldHit ? 0.34 : 0.5);
	}

	/**
	 * Clears all combat pressure for a fresh finite reinforcement deployment.
	 * @returns {void}
	 * @sideEffects Resets suppression to zero.
	 */
	clear() {
		this.gevurahValue = 0;
	}

	/** @returns {number} Multiplicative aim-dispersion penalty derived from current bounded pressure. */
	get aimPenalty() {
		return 1 + this.gevurahValue * 1.8;
	}

	/** @returns {number} Current normalized retreat pressure in the [0,1] range. */
	get retreatPressure() {
		return this.gevurahValue;
	}

	/** @returns {number} Historical suppression scalar alias retained for callers that inspect `.value`. */
	get value() {
		return this.gevurahValue;
	}
}
