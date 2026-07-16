//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AccessibilityProfileService
 * @description
 * Accessibility on Awtsmoos.com is a saved profile of motion, contrast, text,
 * captions, audio cues, timing, input, reading order, and cognitive support.
 * The Awtsmoos excludes no soul; every finite interface must remain adaptable.
 */
const DEFAULT_PROFILE = Object.freeze({
	reducedMotion: false,
	highContrast: false,
	textScale: 1,
	fontFamily: 'system',
	captions: true,
	visualAudioCues: true,
	extendedTimers: false,
	simplifiedMode: false,
	pauseAnytime: true,
	readingOrder: 'document',
	inputMode: 'automatic',
	colorBlindMode: 'none',
	flashReduction: true
});

export class AccessibilityProfileService {
	create(overrides = {}) {
		return this.update(DEFAULT_PROFILE, overrides);
	}

	update(profile, changes) {
		const next = { ...profile, ...changes };
		next.textScale = Math.max(0.8, Math.min(2.5, next.textScale));
		const allowedInput = ['automatic', 'keyboard', 'mouse', 'touch', 'controller'];
		if (!allowedInput.includes(next.inputMode)) {
			throw new Error('AccessibilityProfileService: unsupported input mode');
		}
		return next;
	}

	applyToDocument(profile, documentElement) {
		documentElement.dataset.reducedMotion = String(profile.reducedMotion);
		documentElement.dataset.highContrast = String(profile.highContrast);
		documentElement.dataset.simplifiedMode = String(profile.simplifiedMode);
		documentElement.dataset.colorBlindMode = profile.colorBlindMode;
		documentElement.style.setProperty('--user-text-scale', profile.textScale);
		return profile;
	}
}
