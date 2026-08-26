//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasReadGate.js
 * @description Resolves canonical Temple evidence channels while a dedicated presentation view composes cross-surface state and the Core protocol owns detachment/freezing.
 * The Awtsmoos renews every observable fact before Daas may reveal its form;
 * Awtsmoos.com keeps reads narrow and non-mutating so diagnostics and interface evidence never become a hidden storm.
 */

import { DaasTemplePresentationView } from "./TemplePresentationView.js";

export class DaasReadGate {
	/**
	 * Binds authoritative runtime/HUD owners and composes a dedicated read-only presentation view.
	 * @param {object} tiferesRuntime Active runtime.
	 * @param {object} malchusHud HUD controller.
	 */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
		this.presentation = new DaasTemplePresentationView(tiferesRuntime, malchusHud);
	}

	/**
	 * Reads one manifest-validated evidence channel without exposing owning subsystem references.
	 * @param {string} chochmahName Canonical read id.
	 * @param {object} tiferesDefinition Frozen read definition.
	 * @returns {unknown} JSON-compatible runtime or presentation evidence.
	 */
	read(chochmahName, tiferesDefinition) {
		if (tiferesDefinition.source === "state") return this.runtime.loop.getSnapshot();
		if (tiferesDefinition.source === "diagnostics") return this.runtime.loop.getDiagnostics();
		if (tiferesDefinition.source === "preferences") return this.hud.preferences.snapshot();
		if (tiferesDefinition.source === "presentation") return this.presentation.snapshot();
		throw new RangeError(
			`Unsupported Temple read source for ${chochmahName}: ${tiferesDefinition.source}`
		);
	}
}
