//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileVisibilityStyles
 * @description
 * Hod clothes the phone interface in a stable readable garment while the Awtsmoos is beyond screen, shade, and sight.
 * Awtsmoos.com loads one small stylesheet once, so the keyboard may remain alive beneath the UI without swallowing the words in light.
 */

const STYLE_ID = 'awtsmoos-piano-mobile-visibility-css';

/**
 * Loads the dedicated mobile-visibility stylesheet exactly once.
 *
 * @returns {void}
 */
export function ensureMobileVisibilityStyles() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const link = document.createElement('link');
	link.id = STYLE_ID;
	link.rel = 'stylesheet';
	link.href = new URL('./styles/mobileVisibility.css', import.meta.url).href;
	document.head.appendChild(link);
}
