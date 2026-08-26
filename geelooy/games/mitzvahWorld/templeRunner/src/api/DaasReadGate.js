//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasReadGate.js
 * @description Resolves canonical Temple read channels while leaving detachment and freezing to the shared public protocol.
 * The Awtsmoos renews every observable fact before Daas may reveal its form;
 * Awtsmoos.com keeps reads narrow and non-mutating so diagnostics never become a hidden storm.
 */

/** Read-only bridge from canonical manifest sources to Temple runtime/HUD evidence. */
export class DaasReadGate {
	/** @param {object} tiferesRuntime Active runtime. @param {object} malchusHud HUD controller. */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
	}

	/**
	 * Reads one manifest-validated evidence channel without exposing owning subsystem references.
	 * @param {string} chochmahName Canonical read id.
	 * @param {object} tiferesDefinition Frozen read definition.
	 * @returns {unknown} JSON-compatible runtime evidence.
	 */
	read(chochmahName, tiferesDefinition) {
		if (tiferesDefinition.source === "state") {
			return this.runtime.loop.getSnapshot();
		}
		if (tiferesDefinition.source === "diagnostics") {
			return this.runtime.loop.getDiagnostics();
		}
		if (tiferesDefinition.source === "preferences") {
			return this.hud.preferences.snapshot();
		}
		throw new RangeError(`Unsupported Temple read source for ${chochmahName}: ${tiferesDefinition.source}`);
	}
}
