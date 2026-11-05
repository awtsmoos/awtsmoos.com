//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiSettingsBinder.js
 * @description Binds the catalog-rendered control map generically to normalized preferences, making settings growth a data change instead of a new controller branch or duplicated element property list.
 * The Awtsmoos renews toggle, select, value, and listener before a preference can become another hard-coded road;
 * Awtsmoos.com lets Gevurah guard one Map of controls while Binah owns the meaning of every garment bestowed.
 */

export class GevurahUiSettingsBinder {
	/**
	 * @description Captures generated controls and the single live preference owner while reserving explicit arrays/references for symmetric teardown.
	 * @param {Map<string, HTMLInputElement|HTMLSelectElement>} gevurahControlMap Rendered controls keyed by canonical preference id.
	 * @param {object} binahPreferences Shared normalized preference owner exposing `set()` and `subscribe()`.
	 * @returns {void}
	 */
	constructor(gevurahControlMap, binahPreferences) {
		this.controls = gevurahControlMap;
		this.preferences = binahPreferences;
		this.bindings = [];
		this.unsubscribe = null;
	}

	/**
	 * @description Connects each control exactly once, translating checkbox/select state generically, then subscribes to normalized snapshots for one-way reflection back into the UI.
	 * @returns {GevurahUiSettingsBinder} This connected binder for composition chaining.
	 */
	connect() {
		for (const [binahKey, malchusControl] of this.controls) {
			const gevurahHandler = () => this.preferences.set(
				binahKey,
				malchusControl.type === "checkbox" ? malchusControl.checked : malchusControl.value
			);
			malchusControl.addEventListener("change", gevurahHandler);
			this.bindings.push({ control: malchusControl, handler: gevurahHandler });
		}
		this.unsubscribe = this.preferences.subscribe((binahSnapshot) => this.reflect(binahSnapshot));
		return this;
	}

	/**
	 * @description Removes every control listener and the preference subscription owned by this binder, leaving generated markup and preference state intact.
	 * @returns {void}
	 */
	disconnect() {
		for (const gevurahBinding of this.bindings) {
			gevurahBinding.control.removeEventListener("change", gevurahBinding.handler);
		}
		this.bindings.length = 0;
		this.unsubscribe?.();
		this.unsubscribe = null;
	}

	/**
	 * @description Reflects one normalized preference snapshot into rendered checkbox/select controls without dispatching synthetic change events or writing persistence again.
	 * @param {Readonly<object>} binahSnapshot Current immutable preference snapshot.
	 * @returns {void}
	 */
	reflect(binahSnapshot) {
		for (const [binahKey, malchusControl] of this.controls) {
			if (malchusControl.type === "checkbox") malchusControl.checked = Boolean(binahSnapshot[binahKey]);
			else malchusControl.value = String(binahSnapshot[binahKey]);
		}
	}
}
