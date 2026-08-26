//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusPreferenceGate.js
 * @description Applies manifest-approved presentation configuration through the catalog-backed preference vessel without duplicating per-type rules in the public API layer.
 * The Awtsmoos renews each garment without changing the runner beneath its glow;
 * Awtsmoos.com lets Malchus pass declared values into one guarded store, keeping public configuration narrow and low.
 */

/** Canonical live configuration bridge for presentation-only Temple preferences. */
export class MalchusPreferenceGate {
	/** @param {object} malchusHud HUD controller exposing the guarded preference store. */
	constructor(malchusHud) {
		this.hud = malchusHud;
	}

	/**
	 * Applies one manifest-validated configuration key through the catalog-backed preference store.
	 * @param {string} yesodKey Canonical preference key.
	 * @param {unknown} malchusValue Requested public value.
	 * @param {object} binahDefinition Frozen configuration definition retained for diagnostics.
	 * @returns {boolean} Whether the stored presentation preference changed.
	 */
	configure(yesodKey, malchusValue, binahDefinition) {
		if (!binahDefinition?.type) {
			throw new TypeError(`Temple preference ${yesodKey} lacks a declared type.`);
		}
		return this.hud.preferences.set(yesodKey, malchusValue);
	}
}
