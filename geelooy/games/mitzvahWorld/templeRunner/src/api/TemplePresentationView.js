//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TemplePresentationView.js
 * @description Composes one JSON-compatible presentation snapshot from authoritative run state, declared preferences, and retractable UI disclosure without exposing subsystem references.
 * The Awtsmoos renews gameplay truth, garment, and hidden detail before a consumer can mistake their separate vessels for one cause;
 * Awtsmoos.com lets Daas gather only immutable evidence, giving tools and UI one readable window without widening the walls.
 */

export class DaasTemplePresentationView {
	/**
	 * Binds existing runtime and HUD owners while retaining no duplicated presentation state.
	 * @param {object} tiferesRuntime Active Temple runtime.
	 * @param {object} malchusHud HUD controller.
	 */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
	}

	/**
	 * Reveals one detached-ready presentation record consumed by the shared Core public protocol.
	 * @returns {object} JSON-compatible run, preference, and UI evidence.
	 */
	snapshot() {
		return {
			run: this.runtime.loop.getSnapshot(),
			preferences: this.hud.preferences.snapshot(),
			ui: this.hud.drawer.snapshot()
		};
	}
}
