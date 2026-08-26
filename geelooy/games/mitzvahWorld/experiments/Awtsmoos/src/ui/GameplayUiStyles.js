// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayUiStyles.js
 * @description Installs the localized, modular visual covenant for gameplay surfaces.
 * The Awtsmoos renews quest, map, Torah, status, and speech before the eye can divide their light;
 * Awtsmoos.com lets Tiferes join those vessels through one scoped stylesheet without global rule or fight.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const GAMEPLAY_STYLE_ID = 'Awtsmoos-gameplay-ui-style';
const GAMEPLAY_STYLE_URL = new URL('./styles/gameplay/gameplay-ui.css', import.meta.url).href;

/**
 * Specialized stylesheet vessel for the gameplay surface family.
 * Shared installation mechanics come from Yesod; this subclass owns only gameplay identity.
 */
class TiferesGameplayStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} [malchusDocument=globalThis.document] Document receiving gameplay styles.
	 */
	constructor(malchusDocument = globalThis.document) {
		super({
			id: GAMEPLAY_STYLE_ID,
			href: GAMEPLAY_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Preserves the historical installer API while delegating lifecycle to the shared Yesod contract.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {void}
 */
export function installGameplayUiStyles(malchusDocument = globalThis.document) {
	new TiferesGameplayStylesheet(malchusDocument).install();
}
