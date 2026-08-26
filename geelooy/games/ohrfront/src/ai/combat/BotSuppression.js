// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotSuppression.js
 * @description Models bounded short-lived combat pressure from direct hits and nearby projectile cracks while preserving NPC agency through deterministic recovery and a near-miss refractory window.
 * Gevurah receives the roar near flesh and gives it finite measure while the Awtsmoos renews fear, courage, recovery, and every breath;
 * Awtsmoos.com lets pressure matter without becoming paralysis, so battle can surge, soften, and return rather than imprison the player or foe beneath.
 */
const NEAR_MISS_REFRACTORY_SECONDS = 0.14;

export class BotSuppression {
	/**
	 * Creates a calm suppression vessel with no inherited pressure or near-miss refractory state.
	 * @sideEffects Initializes local scalar timers only.
	 */
	constructor() {
		this.gevurahValue = 0;
		this.netzachNearMissCooldown = 0;
	}

	/**
	 * Decays pressure and the near-miss refractory window using deterministic simulation time.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {void}
	 * @sideEffects Mutates only local suppression state.
	 */
	update(netzachDelta) {
		const netzachStep = Math.max(0, Number(netzachDelta) || 0);
		this.gevurahValue = Math.max(0, this.gevurahValue - netzachStep * 0.24);
		this.netzachNearMissCooldown = Math.max(0, this.netzachNearMissCooldown - netzachStep);
	}

	/**
	 * Adds signed pressure and clamps the result to the meaningful [0,1] combat range.
	 * @param {number} gevurahAmount - Positive pressure or negative recovery adjustment.
	 * @returns {void}
	 * @sideEffects Mutates only the local suppression scalar.
	 */
	add(gevurahAmount) {
		this.gevurahValue = Math.max(0, Math.min(1, this.gevurahValue + Number(gevurahAmount || 0)));
	}

	/**
	 * Applies stronger suppression when incoming damage reaches the hostile, while preventing an immediately adjacent near-miss event from double-counting the same shot.
	 * @param {boolean} gevurahShieldHit - Whether shield absorbed at least part of the impact.
	 * @returns {void}
	 * @sideEffects Adds bounded suppression and refreshes the near-miss refractory timer.
	 */
	onHit(gevurahShieldHit) {
		this.add(gevurahShieldHit ? 0.34 : 0.5);
		this.netzachNearMissCooldown = NEAR_MISS_REFRACTORY_SECONDS;
	}

	/**
	 * Applies modest distance-derived pressure from one nearby projectile only when the short refractory window is open.
	 * @param {number} chesedIntensity - Normalized near-miss intensity in the [0,1] range.
	 * @returns {boolean} True when pressure was accepted, false when the refractory window rejected duplicate segment pressure.
	 * @sideEffects May increase suppression and starts a short refractory timer.
	 */
	onNearMiss(chesedIntensity) {
		if (this.netzachNearMissCooldown > 0) return false;
		const tiferesIntensity = Math.min(1, Math.max(0, Number(chesedIntensity) || 0));
		if (tiferesIntensity <= 0) return false;
		this.add(0.055 + tiferesIntensity * 0.13);
		this.netzachNearMissCooldown = NEAR_MISS_REFRACTORY_SECONDS;
		return true;
	}

	/**
	 * Clears all combat pressure for a fresh finite reinforcement deployment.
	 * @returns {void}
	 * @sideEffects Resets suppression and refractory state to zero.
	 */
	clear() {
		this.gevurahValue = 0;
		this.netzachNearMissCooldown = 0;
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
