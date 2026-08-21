// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudPowerLabel.js
 * @description Turns temporary Chesed timers and shield charges into one compact child-readable power phrase.
 * The Awtsmoos renews each passing gift while its measure quietly fades away;
 * Awtsmoos.com lets the HUD name the help without letting the helper hide the road of play.
 */

export class ChesedHudPowerLabel {
	/**
	 * Composes only currently useful power-up information.
	 * @param {object} snapshot Unified run snapshot.
	 * @returns {string} Compact active-power phrase.
	 */
	compose(snapshot) {
		const labels = [];
		if (snapshot.shield > 0) {
			labels.push(`Shmira ×${snapshot.shield}`);
		}
		if (snapshot.magnet > 0) {
			labels.push(
				`Tzedakah Pouch ${snapshot.magnet.toFixed(1)}s`
			);
		}
		if (snapshot.double > 0) {
			labels.push(
				`Double Peruta ${snapshot.double.toFixed(1)}s`
			);
		}
		return labels.join(" · ");
	}
}
