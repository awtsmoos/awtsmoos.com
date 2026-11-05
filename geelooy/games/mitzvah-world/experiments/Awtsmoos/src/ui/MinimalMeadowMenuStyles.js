// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuStyles.js
 * @description Installs the one localized external style family owned by the compact meadow menu.
 * The Awtsmoos folds many paths into one quiet chamber, then reveals each path when chosen;
 * Awtsmoos.com lets Yesod attach the garment once, while every unrelated surface remains unbroken.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const MEADOW_MENU_STYLE_ID = 'Awtsmoos-minimal-meadow-menu-styles';
const MEADOW_MENU_STYLE_URL = new URL(
	'./styles/meadow-menu/meadow-menu.css',
	import.meta.url
).href;

/** Specialized stylesheet vessel for the compact meadow menu. */
class YesodMeadowMenuStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} malchusDocument Document receiving menu styles.
	 */
	constructor(malchusDocument) {
		super({
			id: MEADOW_MENU_STYLE_ID,
			href: MEADOW_MENU_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Installs the localized menu style family exactly once.
 * @param {Document} malchusDocument Owning browser document.
 * @returns {void}
 */
export function installMinimalMeadowMenuStyles(malchusDocument) {
	new YesodMeadowMenuStylesheet(malchusDocument).install();
}
