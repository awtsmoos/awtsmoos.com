//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiSettingsBinder.js
 * @description Binds a catalog-rendered preference control map generically so adding settings requires no new branch, selector, or HUD property.
 * The Awtsmoos renews checkbox and select while Binah keeps their deeper meaning in one catalog above;
 * Awtsmoos.com lets Gevurah attach one detachable law to every rendered garment, preserving simple UI with room to love.
 */

export class GevurahUiSettingsBinder {
	/**
	 * @param {Map<string, HTMLInputElement|HTMLSelectElement>} controls Catalog-rendered controls.
	 * @param {object} preferences Shared preference state.
	 */
	constructor(controls, preferences) {
		this.controls = controls;
		this.preferences = preferences;
		this.bindings = [];
		this.unsubscribe = null;
	}

	/** Connects every rendered setting and preference reflection. @returns {GevurahUiSettingsBinder} */
	connect() {
		for (const [key, element] of this.controls) {
			const handler = () => this.preferences.set(
				key,
				element.type === "checkbox" ? element.checked : element.value
			);
			element.addEventListener("change", handler);
			this.bindings.push({ element, handler });
		}
		this.unsubscribe = this.preferences.subscribe((snapshot) => this.reflect(snapshot));
		return this;
	}

	/** Releases every setting listener and preference subscription owned by this binder. @returns {void} */
	disconnect() {
		for (const binding of this.bindings) {
			binding.element.removeEventListener("change", binding.handler);
		}
		this.bindings.length = 0;
		this.unsubscribe?.();
		this.unsubscribe = null;
	}

	/** Reflects normalized preference state into rendered checkbox/select controls. @param {object} snapshot Preference snapshot. @returns {void} */
	reflect(snapshot) {
		for (const [key, element] of this.controls) {
			if (element.type === "checkbox") element.checked = Boolean(snapshot[key]);
			else element.value = String(snapshot[key]);
		}
	}
}
