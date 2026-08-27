//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudPowerLabel.js
 * @description Composes whole-second temporary Chesed timers and semantic power identity into one compact child-readable phrase without touching DOM or gameplay state.
 * The Awtsmoos renews each passing gift while its measure quietly fades away;
 * Awtsmoos.com names the help with fewer changing digits, so the eye can stay upon the road of play.
 */

export class ChesedHudPowerLabel {
	/**
	 * @description Composes all simultaneously active shield/magnet/double effects into one restrained phrase, rounding countdown timers upward to avoid noisy sub-second HUD churn.
	 * @param {object} chesedSnapshot Unified run snapshot containing shield charges and timed magnet/double effects.
	 * @returns {string} Compact active-power phrase, empty when no temporary power is active.
	 */
	compose(chesedSnapshot) {
		const chesedLabels = [];
		if (chesedSnapshot.shield > 0) chesedLabels.push(`Shmira ×${chesedSnapshot.shield}`);
		if (chesedSnapshot.magnet > 0) chesedLabels.push(`Tzedakah Pouch ${Math.ceil(chesedSnapshot.magnet)}s`);
		if (chesedSnapshot.double > 0) chesedLabels.push(`Double Peruta ${Math.ceil(chesedSnapshot.double)}s`);
		return chesedLabels.join(" · ");
	}

	/**
	 * @description Resolves the semantic CSS identity of the currently active power combination without generating visual classes or mutating the snapshot.
	 * @param {object} chesedSnapshot Unified run snapshot containing power state.
	 * @returns {string} `none`, one single power id, or `mixed` when multiple power families are active.
	 */
	kind(chesedSnapshot) {
		const chesedActive = [];
		if (chesedSnapshot.shield > 0) chesedActive.push("shield");
		if (chesedSnapshot.magnet > 0) chesedActive.push("magnet");
		if (chesedSnapshot.double > 0) chesedActive.push("double");
		if (!chesedActive.length) return "none";
		return chesedActive.length > 1 ? "mixed" : chesedActive[0];
	}
}
