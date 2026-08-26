// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasReadGate.js
 * @description Reveals immutable state, diagnostics, preferences, and API-description data without leaking mutable runtime controllers into browser callers.
 * The Awtsmoos renews hidden truth before Daas gathers a finite reflection for sight;
 * Awtsmoos.com lets callers know deeply without touching the vessels that keep the runner alive in flight.
 */

import { TEMPLE_API_MANIFEST } from "./TempleApiManifest.js";

export class DaasReadGate {
	/**
	 * Stores read-only pathways into Olam and Malchus vessels; this gate itself performs no state mutation.
	 * @param {object} olamRuntime Live Temple Runner Olam containing the authoritative game loop.
	 * @param {object} malchusHud HUD vessel containing persisted presentation preferences.
	 */
	constructor(olamRuntime, malchusHud) {
		this.olamRuntime = olamRuntime;
		this.malchusHud = malchusHud;
		Object.freeze(this);
	}

	/**
	 * Reveals one manifest-declared knowledge surface while unsupported names remain closed.
	 * Runtime snapshots keep the immutability semantics of their owning composers; the manifest revelation is deeply frozen.
	 * @param {string} daasReadName Stable browser read name such as `getState`, `getDiagnostics`, or `describe`.
	 * @returns {object|null} Requested revelation, or `null` when no knowledge covenant exists.
	 */
	reveal(daasReadName) {
		const daasReadCovenant = TEMPLE_API_MANIFEST.reads[daasReadName];
		if (!daasReadCovenant) {
			return null;
		}
		if (daasReadCovenant.source === "state") {
			return this.olamRuntime.loop.getSnapshot();
		}
		if (daasReadCovenant.source === "diagnostics") {
			return this.olamRuntime.loop.getDiagnostics();
		}
		if (daasReadCovenant.source === "preferences") {
			return this.malchusHud.preferences.snapshot();
		}
		return TEMPLE_API_MANIFEST;
	}
}
