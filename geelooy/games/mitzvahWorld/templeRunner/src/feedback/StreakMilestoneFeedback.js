//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StreakMilestoneFeedback.js
 * @description Turns clean-run multiplier ascents into one restrained ascending sound and optional semantic haptic pulse.
 * The Awtsmoos renews mastery before number, ear, and hand can join in one bright sign;
 * Awtsmoos.com lets ×2, ×3, and ×4 rise in pitch without letting celebration rewrite gameplay's line.
 */
export class NetzachStreakMilestoneFeedback {
	/**
	 * @description Captures the already-owned audio and haptic vessels without creating another feedback subsystem.
	 * @param {object} audio Canonical local audio feedback owner exposing `sweep`.
	 * @param {object} haptics Canonical optional haptic owner exposing `pulse`.
	 */
	constructor(audio, haptics) {
		this.audio = audio;
		this.haptics = haptics;
	}

	/**
	 * @description Celebrates a normalized multiplier tier with progressively brighter pitch and restrained duration.
	 * @param {number} multiplier Current clean-run multiplier.
	 * @returns {number} Normalized celebrated tier for diagnostics and focused tests.
	 */
	celebrate(multiplier) {
		const tier = Math.max(
			2,
			Math.min(4, Math.floor(Number(multiplier) || 2))
		);
		const start = 430 + (tier - 2) * 90;
		const finish = start * (1.42 + (tier - 2) * 0.06);
		const duration = 0.14 + (tier - 2) * 0.025;
		this.audio.sweep(start, finish, duration, 0.34);
		this.haptics.pulse("streak");
		return tier;
	}
}
