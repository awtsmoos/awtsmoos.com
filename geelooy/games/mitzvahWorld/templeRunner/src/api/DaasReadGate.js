//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasReadGate.js
 * @description Resolves canonical Temple evidence channels while dedicated presentation and UI-discovery views compose cross-surface state without exposing owning subsystem references.
 * The Awtsmoos renews every observable fact before Daas may reveal its form;
 * Awtsmoos.com keeps reads narrow and non-mutating so diagnostics, presentation, and interface discovery never become a hidden storm.
 */

import { DaasTemplePresentationView } from "./TemplePresentationView.js";
import { DaasTempleUiDiscoveryView } from "./TempleUiDiscoveryView.js";

export class DaasReadGate {
	/**
	 * Binds authoritative runtime/HUD owners and composes dedicated read-only views for presentation and UI discovery.
	 * @param {object} tiferesRuntime Active runtime.
	 * @param {object} malchusHud HUD controller.
	 */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
		this.presentation = new DaasTemplePresentationView(tiferesRuntime, malchusHud);
		this.uiDiscovery = new DaasTempleUiDiscoveryView(malchusHud);
	}

	/**
	 * Reads one manifest-validated evidence channel without exposing mutable owner references or requiring callers to parse internal manifests.
	 * @param {string} chochmahName Canonical read id.
	 * @param {object} tiferesDefinition Frozen read definition.
	 * @returns {unknown} JSON-compatible runtime, presentation, or discovery evidence.
	 */
	read(chochmahName, tiferesDefinition) {
		const source = tiferesDefinition.source;
		if (source === "state") return this.runtime.loop.getSnapshot();
		if (source === "diagnostics") return this.runtime.loop.getDiagnostics();
		if (source === "preferences") return this.hud.preferences.snapshot();
		if (source === "presentation") return this.presentation.snapshot();
		if (source === "ui") return this.uiDiscovery.snapshot();
		throw new RangeError(`Unsupported Temple read source for ${chochmahName}: ${source}`);
	}
}
