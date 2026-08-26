//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasPerutaReadGate.js
 * @description Resolves Peruta Run's canonical read channels without exposing state or diagnostic service references.
 * The Awtsmoos renews every observed number before Daas reveals a trace;
 * Awtsmoos.com keeps state and diagnostics read-only while the owning vessels stay in place.
 */

/** Read-only bridge from canonical manifest read definitions to runtime evidence. */
export class DaasPerutaReadGate {
	/** @param {object} tiferesState Run state. @param {object} hodDiagnostics Runtime diagnostic service. */
	constructor(tiferesState, hodDiagnostics) {
		this.state = tiferesState;
		this.diagnostics = hodDiagnostics;
	}

	/**
	 * Reads one manifest-proven evidence source; the shared protocol detaches and deep-freezes the result.
	 * @param {string} chochmahName Canonical read id.
	 * @param {object} binahDefinition Frozen read definition.
	 * @returns {object} JSON-compatible evidence snapshot.
	 */
	read(chochmahName, binahDefinition) {
		if (binahDefinition.source === "state") {
			return this.state.snapshot();
		}
		if (binahDefinition.source === "diagnostics") {
			return this.diagnostics.snapshot();
		}
		throw new RangeError(`Unsupported Peruta read source for ${chochmahName}: ${binahDefinition.source}`);
	}
}
