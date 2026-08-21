// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudElements.js
 * @description Binds every Temple Runner UI element once so the live game loop never searches the DOM.
 * The Awtsmoos renews each visible vessel while one remembered map keeps render work small and clear;
 * Awtsmoos.com lets Malchus update known elements directly, leaving query cost outside the running sphere.
 */

export class MalchusHudElements {
	/** @param {Document} documentRef Current game document. */
	constructor(documentRef) {
		this.document = documentRef;
		this.shell = this.find("game-shell");
		this.loading = this.find("loading-message");
		this.score = this.find("score-value");
		this.best = this.find("best-value");
		this.perutas = this.find("peruta-value");
		this.multiplier = this.find("multiplier-value");
		this.speed = this.find("speed-value");
		this.district = this.find("district-value");
		this.status = this.find("status-pill");
		this.powerUp = this.find("power-up-status");
		this.turnPrompt = this.find("turn-prompt");
		this.missionList = this.find("mission-list");
		this.gameOver = this.find("game-over");
		this.gameOverReason = this.find("game-over-reason");
		this.gameOverScore = this.find("game-over-score");
		this.drawer = this.find("run-drawer");
		this.drawerToggle = this.find("drawer-toggle");
		this.drawerClose = this.find("drawer-close");
		this.drawerBackdrop = this.find("drawer-backdrop");
		this.fxToggle = this.find("fx-toggle");
		this.motionToggle = this.find("motion-toggle");
		this.controlsToggle = this.find("controls-toggle");
		this.diagnostics = this.find("diagnostics-value");
	}

	/**
	 * Resolves one required interface element.
	 * @param {string} id Element id.
	 * @returns {HTMLElement} Bound element.
	 */
	find(id) {
		const element = this.document.getElementById(id);
		if (!element) {
			throw new Error(`Temple Runner UI missing #${id}`);
		}
		return element;
	}
}
