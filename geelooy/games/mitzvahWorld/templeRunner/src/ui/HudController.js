//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudController.js
 * @description Composes the compact run rail, catalog-rendered settings, retractable Binah drawer, preferences, lifecycle overlays, and advanced diagnostics.
 * The Awtsmoos renews the visible shell while smaller vessels guard metrics, settings, and hidden detail;
 * Awtsmoos.com keeps this controller a modest crown, letting the road remain the player's greater field.
 */

import { MalchusHudElements } from "./HudElements.js";
import { HodHudMetricAnimator } from "./HudMetricAnimator.js";
import { TiferesHudRunPresenter } from "./HudRunPresenter.js";
import { BinahRunDrawerController } from "./RunDrawerController.js";
import { BinahUiPreferences } from "./UiPreferences.js";
import { GevurahUiSettingsBinder } from "./UiSettingsBinder.js";
import { BinahUiSettingsRenderer } from "./UiSettingsRenderer.js";

export class TempleHudController {
	/** @param {Document} documentRef Current game document. */
	constructor(documentRef) {
		this.elements = new MalchusHudElements(documentRef);
		this.metrics = new HodHudMetricAnimator();
		this.presenter = new TiferesHudRunPresenter(this.elements, this.metrics);
		this.preferences = new BinahUiPreferences(this.elements.shell, documentRef.defaultView);
		const controls = new BinahUiSettingsRenderer(this.elements.settingsList).render();
		this.settings = new GevurahUiSettingsBinder(controls, this.preferences).connect();
		this.drawer = new BinahRunDrawerController(this.elements).connect();
		this.lastDiagnostics = "";
	}

	/** Updates the native startup message while keeping loading chrome visible. @param {string} message Loading-stage message. @returns {void} */
	setLoading(message) {
		this.elements.loading.hidden = false;
		this.metrics.set(this.elements.loading, message);
	}

	/** Removes startup chrome once the native world is ready. @returns {void} */
	setReady() {
		this.elements.loading.hidden = true;
		this.elements.status.hidden = true;
	}

	/** Presents one frame snapshot without querying or rebuilding the DOM. @param {object} snapshot Unified run snapshot. @param {string|null} turnDirection Required corner direction. @returns {void} */
	render(snapshot, turnDirection = null) {
		this.presenter.render(snapshot, turnDirection);
		if (snapshot.status === "gameover") this.showGameOver(snapshot);
	}

	/** Publishes advanced diagnostics only when serialized evidence changes. @param {object|string} diagnostics Runtime evidence. @returns {void} */
	setDiagnostics(diagnostics) {
		const text = typeof diagnostics === "string" ? diagnostics : JSON.stringify(diagnostics, null, 2);
		if (text === this.lastDiagnostics) return;
		this.lastDiagnostics = text;
		this.elements.diagnostics.textContent = text;
	}

	/** Reveals the completion overlay and retracts advanced detail. @param {object} snapshot Completed run snapshot. @returns {void} */
	showGameOver(snapshot) {
		this.drawer.close(false);
		this.metrics.set(this.elements.gameOverReason, snapshot.reason || "The run ended.");
		this.metrics.set(this.elements.gameOverScore, `Score ${snapshot.score} · ${snapshot.perutas} perutas`);
		this.elements.gameOver.hidden = false;
	}

	/** Restores the live road after restart. @returns {void} */
	hideGameOver() {
		this.elements.gameOver.hidden = true;
		this.elements.turnPrompt.hidden = true;
	}

	/** Reveals a startup failure inside the existing loading vessel. @param {unknown} error Fatal startup failure. @returns {void} */
	showError(error) {
		this.setLoading(`Could not reveal the Temple path: ${error?.message || error}`);
	}

	/** Releases every UI-owned listener and preference subscription. @returns {void} */
	dispose() {
		this.settings.disconnect();
		this.drawer.disconnect();
	}
}
