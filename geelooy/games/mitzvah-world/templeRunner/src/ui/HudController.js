//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudController.js
 * @description Composes compact run presentation, generated settings, startup/network hints, lifecycle overlays, diagnostics, and retractable detail through focused UI vessels instead of owning their internal behavior.
 * The Awtsmoos renews the visible shell while Tiferes joins many vessels without becoming their source;
 * Awtsmoos.com keeps this controller a modest crown, letting every deeper responsibility grow in its own course.
 */

import { DaasHudDiagnosticsPresenter } from "./HudDiagnosticsPresenter.js";
import { MalchusHudElements } from "./HudElements.js";
import { MalchusHudLifecyclePresenter } from "./HudLifecyclePresenter.js";
import { HodHudLoadingPresenter } from "./HudLoadingPresenter.js";
import { HodHudMetricAnimator } from "./HudMetricAnimator.js";
import { HodHudNetworkHintPresenter } from "./HudNetworkHintPresenter.js";
import { TiferesHudRunPresenter } from "./HudRunPresenter.js";
import { BinahRunDrawerController } from "./RunDrawerController.js";
import { BinahUiPreferences } from "./UiPreferences.js";
import { GevurahUiSettingsBinder } from "./UiSettingsBinder.js";
import { BinahUiSettingsRenderer } from "./UiSettingsRenderer.js";

export class TempleHudController {
	/**
	 * @description Composes every route-local UI subsystem around one stable element registry while leaving gameplay, transport, and browser-network ownership outside the HUD.
	 * @param {Document} documentRef Current Temple Runner document and source of route-local window preference state.
	 * @returns {void}
	 */
	constructor(documentRef) {
		this.elements = new MalchusHudElements(documentRef);
		this.metrics = new HodHudMetricAnimator();
		this.loading = new HodHudLoadingPresenter(this.elements, this.metrics);
		this.networkHint = new HodHudNetworkHintPresenter(this.elements, this.metrics);
		this.presenter = new TiferesHudRunPresenter(this.elements, this.metrics);
		this.preferences = new BinahUiPreferences(this.elements.shell, documentRef.defaultView);
		const binahControls = new BinahUiSettingsRenderer(this.elements.settingsList).render();
		this.settings = new GevurahUiSettingsBinder(binahControls, this.preferences).connect();
		this.drawer = new BinahRunDrawerController(this.elements).connect();
		this.lifecycle = new MalchusHudLifecyclePresenter(this.elements, this.metrics, this.drawer);
		this.diagnostics = new DaasHudDiagnosticsPresenter(this.elements.diagnostics);
	}

	/**
	 * @description Delegates one human-readable startup stage to the dedicated loading-card presenter.
	 * @param {string} hodMessage Loading-stage message shown inside the bounded loading card.
	 * @returns {void}
	 */
	setLoading(hodMessage) {
		this.loading.show(hodMessage);
	}

	/**
	 * @description Renders one exceptional browser connectivity hint while normal network conditions remain silent and uncluttered.
	 * @param {Readonly<object>} netzachSnapshot Detached browser network-condition evidence.
	 * @returns {void}
	 */
	setNetworkStatus(netzachSnapshot) {
		this.networkHint.render(netzachSnapshot);
	}

	/**
	 * @description Conceals startup chrome and the idle status pill only after the native world is ready for play.
	 * @returns {void}
	 */
	setReady() {
		this.loading.ready();
		this.elements.status.hidden = true;
	}

	/**
	 * @description Presents one unified run snapshot and delegates completed-run revelation only when runtime status requires it.
	 * @param {object} tiferesSnapshot Unified immutable run snapshot.
	 * @param {string|null} [netzachTurnDirection=null] Required corner direction or null when no turn prompt is active.
	 * @returns {void}
	 */
	render(tiferesSnapshot, netzachTurnDirection = null) {
		this.presenter.render(tiferesSnapshot, netzachTurnDirection);
		if (tiferesSnapshot.status === "gameover") this.lifecycle.showGameOver(tiferesSnapshot);
	}

	/**
	 * @description Delegates advanced runtime evidence publication to the change-detecting diagnostic presenter.
	 * @param {object|string} daasDiagnostics Runtime evidence object or already-serialized diagnostic text.
	 * @returns {void}
	 */
	setDiagnostics(daasDiagnostics) {
		this.diagnostics.set(daasDiagnostics);
	}

	/**
	 * @description Restores the live-road lifecycle garment after restart without exposing lifecycle-presenter internals to runtime callers.
	 * @returns {void}
	 */
	hideGameOver() {
		this.lifecycle.hideGameOver();
	}

	/**
	 * @description Routes a fatal startup failure into the dedicated loading presenter's error garment.
	 * @param {unknown} gevurahError Fatal startup failure from renderer, model, network, or assembly revelation.
	 * @returns {void}
	 */
	showError(gevurahError) {
		this.loading.error(gevurahError);
	}

	/**
	 * @description Releases every UI-owned listener and preference subscription while leaving route/runtime disposal to their rightful owners.
	 * @returns {void}
	 */
	dispose() {
		this.settings.disconnect();
		this.drawer.disconnect();
	}
}
