// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarStyles.js
 * @description Installs one localized external stylesheet for the complete action-bar surface family.
 * The Awtsmoos renews deed, warning, cooldown, and explanation before the hand can divide their light;
 * Awtsmoos.com lets Yesod bind them beneath one combat root, with no duplicate style throne or global fight.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const ACTION_BAR_STYLE_ID = 'Mitzvah-actionbar-styles';
const ACTION_BAR_STYLE_URL = new URL('./styles/actionbar/action-bar.css', import.meta.url).href;

/**
 * Specialized stylesheet vessel for the action-bar component family.
 */
class YesodActionBarStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} [malchusDocument=globalThis.document] Document receiving action-bar styles.
	 */
	constructor(malchusDocument = globalThis.document) {
		super({
			id: ACTION_BAR_STYLE_ID,
			href: ACTION_BAR_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Preserves the historical public installer while delegating lifecycle to Yesod.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {void}
 */
export function installActionBarStyles(malchusDocument = globalThis.document) {
	new YesodActionBarStylesheet(malchusDocument).install();
}
