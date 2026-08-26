//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiPreferences.js
 * @description Persists catalog-declared presentation preferences and reflects them through route-local shell attributes without allowing UI choice to mutate gameplay truth.
 * The Awtsmoos renews every chosen garment while the runner remains deeper than the garment's hue;
 * Awtsmoos.com lets Binah persist only declared preferences, then publishes one immutable snapshot to every listening view.
 */

import { TEMPLE_PREFERENCES, normalizeTemplePreference } from "../api/TemplePreferenceCatalog.js";

const STORAGE_PREFIX = "awtsmoosTempleRunner.";

export class BinahUiPreferences {
	/** @param {HTMLElement} shell Game shell. @param {Window} windowRef Browser window. */
	constructor(shell, windowRef = window) {
		this.shell = shell;
		this.window = windowRef;
		this.listeners = new Set();
		this.state = this.revealInitialState();
		this.apply();
	}

	/** Builds normalized initial state from storage, declared defaults, and system reduced-motion preference. @returns {object} */
	revealInitialState() {
		const state = {};
		for (const [key, definition] of Object.entries(TEMPLE_PREFERENCES)) {
			let fallback = definition.defaultValue;
			if (key === "reducedMotion") {
				fallback = this.window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
			}
			state[key] = this.read(key, fallback);
		}
		return state;
	}

	/** @returns {Readonly<object>} Frozen current preference snapshot. */
	snapshot() {
		return Object.freeze({ ...this.state });
	}

	/** Changes one declared preference and publishes only when normalized state truly changes. @param {string} key Preference key. @param {unknown} value Requested value. @returns {boolean} */
	set(key, value) {
		if (!(key in TEMPLE_PREFERENCES)) return false;
		const normalized = normalizeTemplePreference(key, value, this.state[key]);
		if (this.state[key] === normalized) return false;
		this.state[key] = normalized;
		this.write(key, normalized);
		this.apply();
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		return true;
	}

	/** Subscribes to future changes and immediately reveals current state. @param {Function} listener Snapshot listener. @returns {Function} Unsubscribe function. */
	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	/** Reflects presentation state through explicit shell data attributes consumed by localized CSS. @returns {void} */
	apply() {
		this.shell.dataset.fx = this.state.fx ? "on" : "off";
		this.shell.dataset.motion = this.state.reducedMotion ? "reduced" : "full";
		this.shell.dataset.controls = this.state.controls ? "shown" : "hidden";
		this.shell.dataset.density = this.state.hudDensity;
	}

	/** Reads and normalizes one stored preference without allowing malformed storage to escape. @param {string} key Preference key. @param {unknown} fallback Default. @returns {boolean|string} */
	read(key, fallback) {
		try {
			const rawValue = this.window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
			if (rawValue === null) return fallback;
			const definition = TEMPLE_PREFERENCES[key];
			const decoded = definition.type === "boolean" ? rawValue === "true" : rawValue;
			return normalizeTemplePreference(key, decoded, fallback);
		} catch {
			return fallback;
		}
	}

	/** Persists one normalized preference without allowing storage denial to block presentation. @param {string} key Preference key. @param {boolean|string} value Stored value. @returns {void} */
	write(key, value) {
		try {
			this.window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(value));
		} catch {
			// Storage denial never blocks live presentation state.
		}
	}
}
