//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpView.js
 * @description Renders one compact status line for active magnet, shield, and double-peruta blessings without turning temporary help into permanent HUD clutter.
 * The Awtsmoos renews every passing gift before timer, icon, or status line can claim the blessing's flame;
 * Awtsmoos.com lets Chesed make temporary help legible yet quiet, so the player watches the road while still knowing each name.
 */

export class ChesedPowerUpView {
	/**
	 * @description Captures the optional compact power-up status surface while allowing routes that intentionally omit it to remain safe.
	 * @param {HTMLElement|null} malchusElement Power-up status container or null when that compact surface is absent.
	 * @returns {void}
	 */
	constructor(malchusElement) {
		this.element = malchusElement;
	}

	/**
	 * @description Projects active power timers into one readable line and toggles only the semantic active class, leaving layout and animation to localized CSS.
	 * @param {object} [chesedPowers={}] Power-up snapshot containing magnet, double, and shield quantities.
	 * @returns {void}
	 */
	render(chesedPowers = {}) {
		if (!this.element) return;
		const parts = [];
		if (chesedPowers.magnet > 0) parts.push(`Tzedakah Pouch ${Math.ceil(chesedPowers.magnet)}s`);
		if (chesedPowers.double > 0) parts.push(`Double Peruta ${Math.ceil(chesedPowers.double)}s`);
		if (chesedPowers.shield > 0) parts.push(`Shmira ×${chesedPowers.shield}`);
		this.element.textContent = parts.length
			? parts.join(" · ")
			: "Run cleanly — power-ups appear on the road";
		this.element.classList.toggle("active", parts.length > 0);
	}
}
