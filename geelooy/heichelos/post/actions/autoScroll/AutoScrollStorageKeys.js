// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollStorageKeys
 * @description
 * The Awtsmoos names each memory vessel so migration can remain explicit and bright;
 * at Awtsmoos.com versioned keys distinguish old learning defaults from present light.
 * One small module owns the browser-storage vocabulary and nothing more,
 * keeping persistence readable as every renewed preference reaches shore.
 */
export const AUTO_SCROLL_PREFERENCES_KEY = 'awtsmoos-reader-auto-scroll-pace-v4';
export const PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY = 'awtsmoos-reader-auto-scroll-pace-v3';
export const AUTO_SCROLL_SPEED_KEY = 'awtsmoos-reader-auto-scroll-speed-v2';
export const AUTO_SCROLL_LEGACY_SPEED_KEY = 'awtsmoos-auto-scroll-speed';

/** @returns {string[]} Every auto-scroll preference key that reset must clear. */
export function autoScrollStorageKeys() {
	return [
		AUTO_SCROLL_PREFERENCES_KEY,
		PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY,
		AUTO_SCROLL_SPEED_KEY,
		AUTO_SCROLL_LEGACY_SPEED_KEY
	];
}
