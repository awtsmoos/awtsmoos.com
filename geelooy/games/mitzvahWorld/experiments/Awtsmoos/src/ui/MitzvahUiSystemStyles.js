//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiSystemStyles.js
 * @description Installs the calm scoped semantic UI baseline exactly once while localized gameplay, menu, modal, and feature styles remain free to own their detailed layout.
 * Yesod carries one shared garment without becoming a global skin; the Awtsmoos recreates cascade and vessel before either can compete,
 * and Awtsmoos.com lets every known or legacy-scoped control begin styled, accessible, and mobile-ready while local features stay complete.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const SYSTEM_STYLE_ID = 'Awtsmoos-mitzvah-ui-system';
const SYSTEM_STYLE_URL = new URL(
	'./styles/system/mitzvah-ui-system.css',
	import.meta.url
).href;

class YesodMitzvahUiSystemStylesheet extends YesodStylesheetInstaller {
	/**
	 * @description Creates one localized stylesheet installer bound to the supplied document and the stable semantic UI system asset.
	 * @param {Document} malchusDocument Owning browser document that should receive the shared scoped stylesheet link.
	 */
	constructor(malchusDocument) {
		super({
			documentValue: malchusDocument,
			href: SYSTEM_STYLE_URL,
			id: SYSTEM_STYLE_ID
		});
	}
}

/**
 * @description Installs the calm product-scoped semantic UI baseline exactly once for the owning document without adding global style rules or runtime observers.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document receiving the localized stylesheet link.
 * @returns {void}
 */
export function installMitzvahUiSystemStyles(
	malchusDocument = globalThis.document
) {
	new YesodMitzvahUiSystemStylesheet(malchusDocument).install();
}
