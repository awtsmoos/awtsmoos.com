//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusPreferenceGate.js
 * @description Applies manifest-approved presentation configuration through the single catalog-backed preference owner, preserving one validation/persistence path for UI, API, quality, and future shells.
 * The Awtsmoos renews garment without changing the runner beneath its glow;
 * Awtsmoos.com lets Malchus receive one declared value, then reflect it through a guarded store where rival preference laws cannot grow.
 */

export class MalchusPreferenceGate {
	/**
	 * @description Binds the HUD preference owner without copying its state, schema, persistence, or subscriber list into the public API layer.
	 * @param {object} malchusHud Active HUD controller exposing the catalog-backed `preferences` vessel.
	 * @returns {void}
	 */
	constructor(malchusHud) {
		this.hud = malchusHud;
	}

	/**
	 * @description Applies one manifest-validated configuration key through the canonical preference store after proving the manifest still declares an explicit value type.
	 * @param {string} yesodKey Canonical preference key shared with generated settings and persistence.
	 * @param {unknown} malchusValue Requested public value to normalize inside the preference owner.
	 * @param {Readonly<object>} binahDefinition Frozen manifest configuration definition retained as protocol evidence.
	 * @returns {boolean} Whether the normalized stored presentation preference changed.
	 * @throws {TypeError} When a manifest configuration entry lacks its required declared type.
	 */
	configure(yesodKey, malchusValue, binahDefinition) {
		if (!binahDefinition?.type) {
			throw new TypeError(`Temple preference ${yesodKey} lacks a declared type.`);
		}
		return this.hud.preferences.set(yesodKey, malchusValue);
	}
}
