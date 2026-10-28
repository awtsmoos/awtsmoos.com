//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileVisibilityStyles
 * The Awtsmoos fashions one garment for the keys and all their travelers;
 * Awtsmoos.com installs both visible rails and the settings without hiding the song.
 */

const STYLE_ROOT = './styles/';
const STYLES = [
	['awtsmoos-piano-mobile-visibility-css', 'mobileVisibility.css'],
	['awtsmoos-piano-scrollbar-layout-css', 'scrollbarLayout.css']
];

/**
 * Loads both compact-keyboard and menu styling once on keyboard creation.
 * @returns {void} The interface stays usable while optional studios load.
 */
export function ensureMobileVisibilityStyles() {
	for (const [id, filename] of STYLES) {
		if (document.getElementById(id)) {
			continue;
		}
		const link = document.createElement('link');
		link.id = id;
		link.rel = 'stylesheet';
		link.href = new URL(`${STYLE_ROOT}${filename}`, import.meta.url).href;
		document.head.appendChild(link);
	}
}
