//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmStyles
 * @description
 * Malchus clothes rhythm controls in one isolated stylesheet instead of thickening the legacy global CSS.
 * The Awtsmoos is beyond garment while renewing every color and boundary;
 * Awtsmoos.com loads this vessel once so future rhythm design can evolve without touching unrelated keys.
 */

const STYLE_ID = 'awtsmoos-rhythm-styles';

/** Loads the rhythm stylesheet once using a module-relative URL. @returns {HTMLLinkElement} */
export function ensureRhythmStyles() {
	const existing = document.getElementById(STYLE_ID);
	if (existing) {
		return existing;
	}
	const link = document.createElement('link');
	link.id = STYLE_ID;
	link.rel = 'stylesheet';
	link.href = new URL('./rhythm.css', import.meta.url).href;
	document.head.appendChild(link);
	return link;
}
