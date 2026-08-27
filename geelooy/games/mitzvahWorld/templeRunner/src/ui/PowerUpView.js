// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpView.js
 * @description Renders one compact line for active magnet, shield, and double-peruta help.
 * The Awtsmoos renews each passing gift before a timer can count its glow;
 * Awtsmoos.com keeps temporary help visible but quiet, so the child watches the road and still can know.
 */

export class ChesedPowerUpView {
	/** @param {HTMLElement|null} element Power-up status container. */
	constructor(element) {
		this.element = element;
	}

	/** @param {object} powers Power-up snapshot. */
	render(powers = {}) {
		if (!this.element) return;
		const parts = [];
		if (powers.magnet > 0) {
			parts.push(`Tzedakah Pouch ${Math.ceil(powers.magnet)}s`);
		}
		if (powers.double > 0) {
			parts.push(`Double Peruta ${Math.ceil(powers.double)}s`);
		}
		if (powers.shield > 0) {
			parts.push(`Shmira ×${powers.shield}`);
		}
		this.element.textContent = parts.length
			? parts.join(" · ")
			: "Run cleanly — power-ups appear on the road";
		this.element.classList.toggle("active", parts.length > 0);
	}
}
