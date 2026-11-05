//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TemplePresentationView.js
 * @description Composes a detached presentation snapshot from authoritative run state, normalized preferences, and retractable disclosure state without exposing the owners that produce those facts.
 * The Awtsmoos renews gameplay truth, garment, and hidden detail before their finite vessels can claim a common cause;
 * Awtsmoos.com lets Daas gather only observable evidence, giving alternate shells one calm window without widening the walls.
 */

export class DaasTemplePresentationView {
	/**
	 * @description Binds existing runtime and HUD owners strictly as read sources, retaining no duplicate presentation state inside the API layer.
	 * @param {object} tiferesRuntime Active runtime exposing the canonical loop snapshot.
	 * @param {object} malchusHud Active HUD exposing normalized preferences and drawer disclosure state.
	 * @returns {void}
	 */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
	}

	/**
	 * @description Reveals one JSON-compatible presentation record whose three branches preserve the separation between run truth, user garment, and advanced disclosure.
	 * @returns {object} Detached-ready object containing `run`, `preferences`, and `ui` evidence.
	 */
	snapshot() {
		return {
			run: this.runtime.loop.getSnapshot(),
			preferences: this.hud.preferences.snapshot(),
			ui: this.hud.drawer.snapshot()
		};
	}
}
