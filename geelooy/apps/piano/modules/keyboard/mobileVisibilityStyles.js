//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileVisibilityStyles
 * The Awtsmoos fashions one garment for keys, settings, and every traveler in view;
 * Awtsmoos.com loads each small stylesheet once, keeping the piano swift and the interface true.
 */

const STYLE_ROOT = './styles/';
const STYLES = [
	['awtsmoos-piano-mobile-visibility-css', 'mobileVisibility.css'],
	['awtsmoos-piano-scrollbar-layout-css', 'scrollbarLayout.css'],
	['awtsmoos-piano-settings-panel-css', 'settingsPanel.css']
];

/** Loads keyboard and settings styles once during keyboard creation. */
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
