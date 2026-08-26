// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KesserCommandGate.js
 * @description Guards every externally requested gameplay command through one manifest-backed status covenant before the canonical input buffer receives it.
 * The Awtsmoos renews intention before left, right, rise, rest, or return can become a deed;
 * Awtsmoos.com lets Kesser keep one command gate above the many controllers, so every caller follows the same seed.
 */

import { TEMPLE_API_MANIFEST } from "./TempleApiManifest.js";

export class KesserCommandGate {
	/**
	 * Binds the authoritative Olam runtime without exposing its mutable graph through the public API surface.
	 * @param {object} olamRuntime Live Temple Runner Olam containing canonical `input` and `state` vessels.
	 */
	constructor(olamRuntime) {
		this.olamRuntime = olamRuntime;
		Object.freeze(this);
	}

	/**
	 * Sends one already-canonical Mitzvah intention into the authoritative input buffer.
	 * This narrow gate performs no alias lookup because the incoming intention already speaks the runtime's command language.
	 * @param {string} mitzvahIntent Canonical one-frame input intention understood by the runtime input vessel.
	 * @returns {boolean} Whether the input vessel accepted the intention.
	 */
	requestMitzvahIntent(mitzvahIntent) {
		return this.olamRuntime.input.request(mitzvahIntent);
	}

	/**
	 * Resolves one simple browser command through covenant data, guards its optional run-status requirement, then dispatches the canonical intention.
	 * Unknown or currently forbidden commands fail closed without mutating the runner.
	 * @param {string} mitzvahCommandName Stable browser command name such as `jump`, `pause`, or `resume`.
	 * @returns {boolean} Whether the command covenant was eligible and accepted by the input vessel.
	 */
	dispatchCovenant(mitzvahCommandName) {
		const mitzvahCommandCovenant = TEMPLE_API_MANIFEST.commands[mitzvahCommandName];
		if (!mitzvahCommandCovenant) {
			return false;
		}
		if (
			mitzvahCommandCovenant.requiredStatus
			&& this.olamRuntime.state.status !== mitzvahCommandCovenant.requiredStatus
		) {
			return false;
		}
		return this.requestMitzvahIntent(mitzvahCommandCovenant.intent);
	}
}
