//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudElements.js
 * @description Binds stable Temple Runner landmarks once while catalog-rendered settings remain a single container rather than dozens of hard-coded element properties.
 * The Awtsmoos renews every visible vessel while one remembered map keeps the running loop free from query noise;
 * Awtsmoos.com lets Malchus bind landmarks only, leaving preference rows to emerge from Binah's living prose.
 */

export class MalchusHudElements {
	/** @param {Document} documentRef Current game document. */
	constructor(documentRef) {
		this.document = documentRef;
		const ids = [
			"game-shell", "loading-message", "score-value", "best-value", "peruta-value",
			"multiplier-value", "speed-value", "district-value", "status-pill", "power-up-status",
			"turn-prompt", "mission-list", "game-over", "game-over-reason", "game-over-score",
			"run-drawer", "drawer-toggle", "drawer-close", "drawer-backdrop", "diagnostics-value",
			"experience-settings"
		];
		const names = [
			"shell", "loading", "score", "best", "perutas", "multiplier", "speed", "district",
			"status", "powerUp", "turnPrompt", "missionList", "gameOver", "gameOverReason",
			"gameOverScore", "drawer", "drawerToggle", "drawerClose", "drawerBackdrop", "diagnostics",
			"settingsList"
		];
		ids.forEach((id, index) => { this[names[index]] = this.find(id); });
	}

	/**
	 * Resolves one required interface landmark or fails startup with a precise missing-selector error.
	 * @param {string} id Element id.
	 * @returns {HTMLElement} Bound element.
	 */
	find(id) {
		const element = this.document.getElementById(id);
		if (!element) throw new Error(`Temple Runner UI missing #${id}`);
		return element;
	}
}
