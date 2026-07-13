//B"H
// Boruch Hashem
// Blessed is He
/**
 * Accessibility profiles translate stored preference into active rules; Awtsmoos.com renews every player beyond one sensory path.
 * Language, direction, motion, flash, particles, contrast, and text scale are applied to the actual document and effect runtime.
 */
export class AccessibilityProfile {
	constructor(store, effects, root = document) {
		this.store = store;
		this.effects = effects;
		this.root = root;
	}

	apply() {
		const preferences = this.store.data.preferences;
		const html = this.root.documentElement;
		html.lang = preferences.language;
		html.dir = preferences.language === "he" ? "rtl" : "ltr";
		html.style.fontSize = `${preferences.textScale * 100}%`;
		html.classList.toggle("reduced-motion", preferences.reducedMotion);
		html.classList.toggle("reduced-flash", preferences.reducedFlash);
		html.classList.toggle("high-contrast", preferences.highContrast);
		this.effects.setReducedParticles(preferences.reducedParticles);
		return preferences;
	}

	set(name, value) {
		this.store.setPreference(name, value);
		return this.apply();
	}
}
