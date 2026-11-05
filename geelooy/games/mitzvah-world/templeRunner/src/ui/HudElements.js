//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudElements.js
 * @description Binds required Temple Runner landmarks once while catalog-rendered preference controls are attached after their dynamic surface is revealed.
 * The Awtsmoos renews canvas, rail, drawer, metric, and loading word before query and element can claim separate roots;
 * Awtsmoos.com lets Malchus remember stable landmarks once, then Binah may grow new controls without hard-coded DOM shoots.
 */

export class MalchusHudElements {
	/**
	 * @description Binds every stable route landmark required by HUD, loading/network hints, settings, diagnostics, overlays, and drawer behavior.
	 * @param {Document} documentRef Current Temple Runner document whose route contract must already exist.
	 * @returns {void}
	 */
	constructor(documentRef) {
		this.document = documentRef;
		this.shell = this.find("game-shell");
		this.loading = this.find("loading-message");
		this.loadingStage = this.find("loading-stage");
		this.loadingNetwork = this.find("loading-network");
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
	 * @description Resolves one required element or fails immediately with the exact missing route contract, preventing partially styled or partially wired UI from surviving startup.
	 * @param {string} malchusId Required DOM id owned by Temple Runner markup.
	 * @returns {HTMLElement} Bound route element proven to exist.
	 * @throws {Error} When the route markup omits a required landmark.
	 */
	find(malchusId) {
		const malchusElement = this.document.getElementById(malchusId);
		if (!malchusElement) throw new Error(`Temple Runner UI missing #${malchusId}`);
		return malchusElement;
	}
}
