// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiSettingsBinder.js
 * @description Joins three advanced drawer toggles to persisted presentation preferences without touching gameplay state.
 * The Awtsmoos renews each chosen garment while the runner's deed remains unchanged beneath the view;
 * Awtsmoos.com keeps setting listeners in one detachable vessel so interface preference stays simple and true.
 */

export class GevurahUiSettingsBinder {
	/**
	 * @param {object} elements Bound HUD elements.
	 * @param {object} preferences Shared preference state.
	 */
	constructor(elements, preferences) {
		this.elements = elements;
		this.preferences = preferences;
		this.bindings = [];
		this.unsubscribe = null;
	}

	/** Connects checkbox events and preference reflection. */
	connect() {
		this.bindToggle(
			this.elements.fxToggle,
			"fx"
		);
		this.bindToggle(
			this.elements.motionToggle,
			"reducedMotion"
		);
		this.bindToggle(
			this.elements.controlsToggle,
			"controls"
		);
		this.unsubscribe = this.preferences.subscribe((snapshot) => {
			this.reflect(snapshot);
		});
		return this;
	}

	/** Releases all listeners owned by this settings vessel. */
	disconnect() {
		for (const binding of this.bindings) {
			binding.element.removeEventListener(
				"change",
				binding.handler
			);
		}
		this.bindings.length = 0;
		this.unsubscribe?.();
		this.unsubscribe = null;
	}

	/** @param {HTMLInputElement} element Checkbox. @param {string} key Preference key. */
	bindToggle(element, key) {
		const handler = () => {
			this.preferences.set(key, element.checked);
		};
		element.addEventListener("change", handler);
		this.bindings.push({
			element,
			handler
		});
	}

	/** @param {object} snapshot Preference snapshot. */
	reflect(snapshot) {
		this.elements.fxToggle.checked = snapshot.fx;
		this.elements.motionToggle.checked = snapshot.reducedMotion;
		this.elements.controlsToggle.checked = snapshot.controls;
	}
}
