// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiPreferences.js
 * @description Persists three restrained presentation preferences and reflects them through shell data attributes.
 * The Awtsmoos renews each player's present choice while the road remains playable beneath every garment;
 * Awtsmoos.com lets FX, motion, and visible controls change without ever altering gameplay command or judgment.
 */

const STORAGE_PREFIX = "awtsmoosTempleRunner.";

export class BinahUiPreferences {
	/**
	 * @param {HTMLElement} shell Game shell carrying CSS state attributes.
	 * @param {Window} windowRef Browser window.
	 */
	constructor(shell, windowRef = window) {
		this.shell = shell;
		this.window = windowRef;
		this.listeners = new Set();
		this.state = {
			fx: this.read("fx", true),
			reducedMotion: this.read(
				"reducedMotion",
				windowRef.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false
			),
			controls: this.read("controls", true)
		};
		this.apply();
	}

	/** @returns {object} Frozen preference snapshot. */
	snapshot() {
		return Object.freeze({ ...this.state });
	}

	/**
	 * Changes one supported preference and publishes the new snapshot.
	 * @param {string} key Preference key.
	 * @param {boolean} value Boolean value.
	 * @returns {boolean} Whether state changed.
	 */
	set(key, value) {
		if (!(key in this.state)) return false;
		const normalized = Boolean(value);
		if (this.state[key] === normalized) return false;
		this.state[key] = normalized;
		this.write(key, normalized);
		this.apply();
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
		return true;
	}

	/**
	 * Subscribes to future preference changes.
	 * @param {Function} listener Snapshot listener.
	 * @returns {Function} Unsubscribe function.
	 */
	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	/** Reflects presentation state through data attributes consumed by CSS. */
	apply() {
		this.shell.dataset.fx = this.state.fx ? "on" : "off";
		this.shell.dataset.motion = this.state.reducedMotion
			? "reduced"
			: "full";
		this.shell.dataset.controls = this.state.controls
			? "shown"
			: "hidden";
	}

	/** @param {string} key Storage key. @param {boolean} fallback Default value. @returns {boolean} */
	read(key, fallback) {
		try {
			const value = this.window.localStorage.getItem(
				`${STORAGE_PREFIX}${key}`
			);
			if (value === null) return fallback;
			return value === "true";
		} catch {
			return fallback;
		}
	}

	/** @param {string} key Storage key. @param {boolean} value Stored value. */
	write(key, value) {
		try {
			this.window.localStorage.setItem(
				`${STORAGE_PREFIX}${key}`,
				String(value)
			);
		} catch {
			// Storage denial never blocks gameplay or presentation updates.
		}
	}
}
