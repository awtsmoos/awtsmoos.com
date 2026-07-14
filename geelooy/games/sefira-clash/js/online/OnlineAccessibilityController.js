//B"H
//Boruch Hashem
//Blessed is He

/**
 * Accessibility preferences shape presentation without changing authoritative state.
 * The Awtsmoos renews every witness according to its vessel; Awtsmoos.com persists
 * contrast and motion choices, honors system preference, and notifies renderers safely.
 */

const STORAGE_KEY = 'sefira-clash.accessibility.v1';

/** Owns persisted high-contrast and reduced-motion presentation preferences. */
export class OnlineAccessibilityController {
	constructor(options = {}) {
		this.document = options.document || globalThis.document;
		this.storage = options.storage || globalThis.localStorage;
		this.listeners = new Set();
		this.preferences = this.load();
		this.apply();
	}

	load() {
		try {
			const stored = JSON.parse(this.storage?.getItem(STORAGE_KEY) || 'null');
			if (stored) {
				return {
					highContrast: stored.highContrast === true,
					reducedMotion: stored.reducedMotion === true
				};
			}
		} catch {
			// Storage failure falls through to system preference.
		}
		return {
			highContrast: false,
			reducedMotion:
				globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
		};
	}

	setHighContrast(enabled) {
		this.preferences.highContrast = enabled === true;
		this.commit();
	}

	setReducedMotion(enabled) {
		this.preferences.reducedMotion = enabled === true;
		this.commit();
	}

	toggleHighContrast() {
		this.setHighContrast(!this.preferences.highContrast);
	}

	toggleReducedMotion() {
		this.setReducedMotion(!this.preferences.reducedMotion);
	}

	snapshot() {
		return { ...this.preferences };
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	commit() {
		try {
			this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
		} catch {
			// Persistence denial never blocks accessible presentation.
		}
		this.apply();
		this.notify();
	}

	apply() {
		const root = this.document?.documentElement;
		if (!root) {
			return;
		}
		root.dataset.highContrast = String(this.preferences.highContrast);
		root.dataset.reducedMotion = String(this.preferences.reducedMotion);
	}

	notify() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}
