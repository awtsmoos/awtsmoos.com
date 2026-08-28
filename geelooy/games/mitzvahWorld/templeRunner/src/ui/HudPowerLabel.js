//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudPowerLabel.js
 * @description Composes whole-second road-power and earned Ruach Rush timers into one compact phrase without touching DOM or gameplay state.
 * The Awtsmoos renews each passing gift and each mastered wind while its measure quietly fades away;
 * Awtsmoos.com names the strongest earned help first, so the eye can stay upon the road of play.
 */

export class ChesedHudPowerLabel {
	/**
	 * @description Composes Rush plus independently active shield/magnet/double evidence, rounding countdowns upward to avoid noisy sub-second HUD churn.
	 * @param {object} chesedSnapshot Unified run snapshot containing Rush, shield charges, and ordinary road timers.
	 * @returns {string} Compact active-power phrase, empty when no temporary help is active.
	 */
	compose(chesedSnapshot) {
		const chesedLabels = [];
		if (chesedSnapshot.rush > 0) {
			chesedLabels.push(`Ruach Rush ${Math.ceil(chesedSnapshot.rush)}s`);
		}
		if (chesedSnapshot.shield > 0) {
			chesedLabels.push(`Shmira ×${chesedSnapshot.shield}`);
		}
		if (chesedSnapshot.magnet > 0) {
			chesedLabels.push(`Tzedakah Pouch ${Math.ceil(chesedSnapshot.magnet)}s`);
		}
		if (chesedSnapshot.double > 0) {
			chesedLabels.push(`Double Peruta ${Math.ceil(chesedSnapshot.double)}s`);
		}
		return chesedLabels.join(" · ");
	}

	/**
	 * @description Resolves semantic CSS identity while treating Rush as its own family and coexistence with any road power as mixed.
	 * @param {object} chesedSnapshot Unified run snapshot containing temporary-power state.
	 * @returns {string} `none`, one single power id, or `mixed` when multiple power families are active.
	 */
	kind(chesedSnapshot) {
		const chesedActive = [];
		if (chesedSnapshot.rush > 0) {
			chesedActive.push("rush");
		}
		if (chesedSnapshot.shield > 0) {
			chesedActive.push("shield");
		}
		if (chesedSnapshot.magnet > 0) {
			chesedActive.push("magnet");
		}
		if (chesedSnapshot.double > 0) {
			chesedActive.push("double");
		}
		if (!chesedActive.length) {
			return "none";
		}
		return chesedActive.length > 1
			? "mixed"
			: chesedActive[0];
	}
}
