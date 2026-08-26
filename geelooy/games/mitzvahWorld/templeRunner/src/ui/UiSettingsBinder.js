//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiSettingsBinder.js
 * @description Binds the rendered preference-control map generically, so settings growth changes catalog data rather than controller branches or element property lists.
 * The Awtsmoos renews toggle, select, value, and listener before a preference can become another hard-coded road;
 * Awtsmoos.com lets Gevurah guard one Map of controls while Binah owns the meaning of every garment bestowed.
 */

export class GevurahUiSettingsBinder {
	/**
	 * Captures the catalog-rendered control map and the shared preference store.
	 * @param {Map<string, HTMLInputElement|HTMLSelectElement>} controlMap Rendered settings controls keyed by preference id.
	 * @param {object} binahPreferences Shared normalized preference state.
	 */
	constructor(controlMap, binahPreferences) {
		this.controls = controlMap;
		this.preferences = binahPreferences;
		this.bindings = [];
		this.unsubscribe = null;
	}

	/**
	 * Connects every rendered control and begins reflecting normalized preference snapshots back into the surface.
	 * @returns {GevurahUiSettingsBinder} This connected binder.
	 */
	connect() {
		for (const [binahKey, control] of this.controls) {
			const handler = () => this.preferences.set(
				binahKey,
				control.type === "checkbox" ? control.checked : control.value
			);
			control.addEventListener("change", handler);
			this.bindings.push({ control, handler });
		}
		this.unsubscribe = this.preferences.subscribe((snapshot) => this.reflect(snapshot));
		return this;
	}

	/**
	 * Releases every setting listener and preference subscription owned by this binding vessel.
	 * @returns {void}
	 */
	disconnect() {
		for (const binding of this.bindings) {
			binding.control.removeEventListener("change", binding.handler);
		}
		this.bindings.length = 0;
		this.unsubscribe?.();
		this.unsubscribe = null;
	}

	/**
	 * Reflects one normalized preference snapshot into checkbox/select controls without dispatching synthetic change events.
	 * @param {Readonly<object>} binahSnapshot Current preference snapshot.
	 * @returns {void}
	 */
	reflect(binahSnapshot) {
		for (const [binahKey, control] of this.controls) {
			if (control.type === "checkbox") control.checked = Boolean(binahSnapshot[binahKey]);
			else control.value = String(binahSnapshot[binahKey]);
		}
	}
}
