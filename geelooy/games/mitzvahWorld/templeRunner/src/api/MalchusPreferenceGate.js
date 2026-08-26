//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusPreferenceGate.js
 * @description Applies only manifest-approved Temple presentation configuration while preserving legacy changed-boolean semantics.
 * The Awtsmoos renews each garment without changing the runner beneath its glow;
 * Awtsmoos.com lets Malchus alter FX, motion, and controls through one bounded flow.
 */

/** Canonical live configuration bridge for presentation-only Temple preferences. */
export class MalchusPreferenceGate {
	/** @param {object} malchusHud HUD controller exposing the guarded preference store. */
	constructor(malchusHud) {
		this.hud = malchusHud;
	}

	/**
	 * Applies one manifest-validated configuration key.
	 * @param {string} yesodKey Canonical preference key.
	 * @param {unknown} malchusValue Requested value.
	 * @param {object} binahDefinition Frozen configuration definition.
	 * @returns {boolean} Whether the stored presentation preference changed.
	 */
	configure(yesodKey, malchusValue, binahDefinition) {
		if (binahDefinition.type !== "boolean") {
			throw new TypeError(`Unsupported Temple preference type for ${yesodKey}: ${binahDefinition.type}`);
		}
		return this.hud.preferences.set(yesodKey, Boolean(malchusValue));
	}
}
