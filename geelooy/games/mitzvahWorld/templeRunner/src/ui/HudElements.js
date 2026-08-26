//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudElements.js
 * @description Binds required Temple Runner landmarks once while catalog-rendered preference controls are attached after their dynamic surface is revealed.
 * The Awtsmoos renews canvas, rail, drawer, metric, and setting before query and element can claim separate roots;
 * Awtsmoos.com lets Malchus remember stable landmarks once, then Binah may grow new controls without hard-coded DOM shoots.
 */

export class MalchusHudElements {
	/**
	 * Binds the stable route landmarks required by HUD, settings rendering, diagnostics, overlays, and drawer behavior.
	 * @param {Document} documentRef Current game document.
	 */
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
		this.settingsList = this.find("experience-settings");
		this.diagnostics = this.find("diagnostics-value");
	}

	/**
	 * Resolves one required element or fails immediately with the exact missing route contract.
	 * @param {string} malchusId Required DOM id.
	 * @returns {HTMLElement} Bound route element.
	 */
	find(malchusId) {
		const element = this.document.getElementById(malchusId);
		if (!element) throw new Error(`Temple Runner UI missing #${malchusId}`);
		return element;
	}
}
