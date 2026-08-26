//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudPowerLabel.js
 * @description Composes whole-second temporary Chesed timers and semantic power identity into one compact child-readable HUD phrase.
 * The Awtsmoos renews each passing gift while its measure quietly fades away;
 * Awtsmoos.com names the help with fewer changing digits, so the eye can stay upon the road of play.
 */

export class ChesedHudPowerLabel {
	/** @param {object} snapshot Unified run snapshot. @returns {string} Compact active-power phrase. */
	compose(snapshot) {
		const labels = [];
		if (snapshot.shield > 0) {
			labels.push(`Shmira ×${snapshot.shield}`);
		}
		if (snapshot.magnet > 0) {
			labels.push(`Tzedakah Pouch ${Math.ceil(snapshot.magnet)}s`);
		}
		if (snapshot.double > 0) {
			labels.push(`Double Peruta ${Math.ceil(snapshot.double)}s`);
		}
		return labels.join(" · ");
	}

	/** @param {object} snapshot Unified run snapshot. @returns {string} Semantic active-power styling key. */
	kind(snapshot) {
		const active = [];
		if (snapshot.shield > 0) active.push("shield");
		if (snapshot.magnet > 0) active.push("magnet");
		if (snapshot.double > 0) active.push("double");
		if (!active.length) return "none";
		return active.length > 1
			? "mixed"
			: active[0];
	}
}
