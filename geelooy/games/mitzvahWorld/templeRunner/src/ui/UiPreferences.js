//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiPreferences.js
 * @description Owns normalized live presentation state, shell reflection, and change publication while delegating local persistence to a separate Yesod storage vessel.
 * The Awtsmoos renews every chosen garment while the runner remains deeper than the garment's hue;
 * Awtsmoos.com lets Binah publish one truthful snapshot as Yesod remembers what it can, and no storage shadow can alter gameplay view.
 */

import {
	TEMPLE_PREFERENCES,
	normalizeTemplePreference
} from "../api/TemplePreferenceCatalog.js";
import { YesodUiPreferenceStorage } from "./UiPreferenceStorage.js";

export class BinahUiPreferences {
	/**
	 * @description Reveals normalized initial preference state from declared defaults, system reduced-motion evidence, and optional persisted values, then immediately reflects it to the route shell.
	 * @param {HTMLElement} binahShell Temple game shell receiving localized `data-*` presentation attributes.
	 * @param {Window|object} [binahWindow=window] Browser-like window supplying matchMedia and persistence services.
	 * @returns {void}
	 */
	constructor(binahShell, binahWindow = window) {
		this.shell = binahShell;
		this.window = binahWindow;
		this.storage = new YesodUiPreferenceStorage(binahWindow);
		this.listeners = new Set();
		this.state = this.revealInitialState();
		this.apply();
	}

	/**
	 * @description Builds one normalized preference object from the canonical catalog, applying system reduced-motion only as the fallback for that declared preference.
	 * @returns {object} Mutable internal state whose values already satisfy the catalog schema.
	 */
	revealInitialState() {
		const binahState = {};
		for (const [binahKey, binahDefinition] of Object.entries(TEMPLE_PREFERENCES)) {
			const binahFallback = this.revealFallback(binahKey, binahDefinition.defaultValue);
			binahState[binahKey] = this.read(binahKey, binahFallback);
		}
		return binahState;
	}

	/**
	 * @description Resolves one preference fallback, honoring the operating system reduced-motion signal only for the matching semantic setting.
	 * @param {string} binahKey Canonical preference key.
	 * @param {boolean|string} malchusDefault Catalog-declared default value.
	 * @returns {boolean|string} Effective fallback before persisted storage is considered.
	 */
	revealFallback(binahKey, malchusDefault) {
		if (binahKey !== "reducedMotion") return malchusDefault;
		return this.window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
	}

	/**
	 * @description Returns a frozen detached snapshot so API, settings, quality, and presentation subscribers cannot mutate the live preference owner.
	 * @returns {Readonly<object>} Frozen current presentation state.
	 */
	snapshot() {
		return Object.freeze({ ...this.state });
	}

	/**
	 * @description Normalizes and applies one declared preference, persists the changed value, reflects shell attributes, and publishes a single new snapshot only when state actually changes.
	 * @param {string} binahKey Canonical preference key declared in `TEMPLE_PREFERENCES`.
	 * @param {unknown} malchusValue Requested public or UI value.
	 * @returns {boolean} Whether live normalized state changed.
	 */
	set(binahKey, malchusValue) {
		if (!(binahKey in TEMPLE_PREFERENCES)) return false;
		const binahNormalized = normalizeTemplePreference(binahKey, malchusValue, this.state[binahKey]);
		if (this.state[binahKey] === binahNormalized) return false;
		this.state[binahKey] = binahNormalized;
		this.storage.write(binahKey, binahNormalized);
		this.apply();
		const binahSnapshot = this.snapshot();
		for (const binahListener of this.listeners) binahListener(binahSnapshot);
		return true;
	}

	/**
	 * @description Registers one future-change listener and immediately reveals current state so subscribers never need a separate initialization read.
	 * @param {Function} binahListener Function receiving immutable preference snapshots.
	 * @returns {Function} Unsubscribe closure removing exactly this listener.
	 */
	subscribe(binahListener) {
		this.listeners.add(binahListener);
		binahListener(this.snapshot());
		return () => this.listeners.delete(binahListener);
	}

	/**
	 * @description Reflects the small CSS-facing presentation vocabulary onto route-local shell attributes without generating style rules or mutating gameplay state.
	 * @returns {void}
	 */
	apply() {
		this.shell.dataset.fx = this.state.fx ? "on" : "off";
		this.shell.dataset.motion = this.state.reducedMotion ? "reduced" : "full";
		this.shell.dataset.controls = this.state.controls ? "shown" : "hidden";
		this.shell.dataset.density = this.state.hudDensity;
	}

	/**
	 * @description Decodes one persisted value according to its declared preference type and normalizes malformed storage back to the supplied fallback.
	 * @param {string} binahKey Canonical preference key.
	 * @param {boolean|string} malchusFallback Effective default/system fallback.
	 * @returns {boolean|string} Normalized persisted value or fallback.
	 */
	read(binahKey, malchusFallback) {
		const yesodRaw = this.storage.read(binahKey);
		if (yesodRaw === null) return malchusFallback;
		const binahDefinition = TEMPLE_PREFERENCES[binahKey];
		const malchusDecoded = binahDefinition.type === "boolean" ? yesodRaw === "true" : yesodRaw;
		return normalizeTemplePreference(binahKey, malchusDecoded, malchusFallback);
	}
}
