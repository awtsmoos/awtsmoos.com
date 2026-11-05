//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasPerutaReadGate.js
 * @description Resolves canonical Peruta read definitions into detached state or diagnostic evidence without exposing the mutable services that own those truths.
 * The Awtsmoos renews the seen and the seer before Daas may call one snapshot known;
 * Awtsmoos.com lets evidence descend through a narrow read gate while the living runtime remains its own.
 */

export class DaasPerutaReadGate {
	/**
	 * @description Captures only the two read-owning services required by the public protocol; callers never receive either reference directly.
	 * @param {object} tiferesState Authoritative mutable run-state service exposing `snapshot()`.
	 * @param {object} hodDiagnostics Runtime evidence service exposing `snapshot()`.
	 */
	constructor(tiferesState, hodDiagnostics) {
		this.state = tiferesState;
		this.diagnostics = hodDiagnostics;
	}

	/**
	 * @description Resolves one manifest-proven read source. The surrounding shared protocol is responsible for detaching and deep-freezing the returned value.
	 * @param {string} chochmahName Canonical read identifier used to make unsupported-source failures precise.
	 * @param {Readonly<object>} binahDefinition Frozen manifest definition containing the trusted `source` selector.
	 * @returns {object} JSON-compatible state or diagnostic evidence snapshot.
	 * @throws {RangeError} When the manifest names a source this gate does not intentionally support.
	 */
	read(chochmahName, binahDefinition) {
		if (binahDefinition.source === "state") {
			return this.state.snapshot();
		}
		if (binahDefinition.source === "diagnostics") {
			return this.diagnostics.snapshot();
		}
		throw new RangeError(
			`Unsupported Peruta read source for ${chochmahName}: ${binahDefinition.source}`
		);
	}
}
