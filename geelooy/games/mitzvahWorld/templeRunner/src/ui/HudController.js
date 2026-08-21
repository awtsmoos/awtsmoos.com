// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudController.js
 * @description Composes the clean run rail, retractable Binah drawer, preferences, lifecycle overlays, and diagnostics.
 * The Awtsmoos renews the visible shell while smaller vessels guard metrics, settings, and hidden detail;
 * Awtsmoos.com keeps this controller a modest crown, letting the road remain the player's greater field.
 */

import { MalchusHudElements } from "./HudElements.js";
import { HodHudMetricAnimator } from "./HudMetricAnimator.js";
import { TiferesHudRunPresenter } from "./HudRunPresenter.js";
import { BinahRunDrawerController } from "./RunDrawerController.js";
import { BinahUiPreferences } from "./UiPreferences.js";
import { GevurahUiSettingsBinder } from "./UiSettingsBinder.js";

export class TempleHudController {
	/** @param {Document} documentRef Current game document. */
	constructor(documentRef) {
		this.elements = new MalchusHudElements(documentRef);
		this.metrics = new HodHudMetricAnimator();
		this.presenter = new TiferesHudRunPresenter(
			this.elements,
			this.metrics
		);
		this.preferences = new BinahUiPreferences(
			this.elements.shell,
			documentRef.defaultView
		);
		this.settings = new GevurahUiSettingsBinder(
			this.elements,
			this.preferences
		).connect();
		this.drawer = new BinahRunDrawerController(
			this.elements
		).connect();
		this.lastDiagnostics = "";
	}

	/** @param {string} message Native loading-stage message. */
	setLoading(message) {
		this.elements.loading.hidden = false;
		this.metrics.set(this.elements.loading, message);
	}

	/** Removes startup chrome once the native world is ready. */
	setReady() {
		this.elements.loading.hidden = true;
		this.elements.status.hidden = true;
	}

	/**
	 * Presents one frame snapshot without querying or rebuilding the DOM.
	 * @param {object} snapshot Unified run snapshot.
	 * @param {string|null} turnDirection Required corner direction.
	 */
	render(snapshot, turnDirection = null) {
		this.presenter.render(snapshot, turnDirection);
		if (snapshot.status === "gameover") {
			this.showGameOver(snapshot);
		}
	}

	/** @param {object|string} diagnostics Advanced runtime evidence. */
	setDiagnostics(diagnostics) {
		const text = typeof diagnostics === "string"
			? diagnostics
			: JSON.stringify(diagnostics, null, 2);
		if (text === this.lastDiagnostics) return;
		this.lastDiagnostics = text;
		this.elements.diagnostics.textContent = text;
	}

	/** @param {object} snapshot Completed run snapshot. */
	showGameOver(snapshot) {
		this.drawer.close(false);
		this.metrics.set(
			this.elements.gameOverReason,
			snapshot.reason || "The run ended."
		);
		this.metrics.set(
			this.elements.gameOverScore,
			`Score ${snapshot.score} · ${snapshot.perutas} perutas`
		);
		this.elements.gameOver.hidden = false;
	}

	/** Restores the live road after restart. */
	hideGameOver() {
		this.elements.gameOver.hidden = true;
		this.elements.turnPrompt.hidden = true;
	}

	/** @param {unknown} error Fatal startup failure. */
	showError(error) {
		this.setLoading(
			`Could not reveal the Temple path: ${error?.message || error}`
		);
	}

	/** Releases UI-owned listeners. */
	dispose() {
		this.settings.disconnect();
		this.drawer.disconnect();
	}
}
