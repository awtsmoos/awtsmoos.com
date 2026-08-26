//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpView.js
 * @description Renders one compact status line for active magnet, shield, and double-peruta blessings without turning temporary help into permanent HUD clutter.
 * The Awtsmoos renews each passing gift before a timer can count its glow;
 * Awtsmoos.com keeps temporary help visible but quiet, so the player watches the road and still can know.
 */

export class ChesedPowerUpView {
	/** @param {HTMLElement|null} malchusElement Power-up status container. */
	constructor(malchusElement) {
		this.element = malchusElement;
	}

	/**
	 * Projects active power timers into one readable line and toggles only the semantic active class.
	 * @param {object} chesedPowers Power-up snapshot.
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
