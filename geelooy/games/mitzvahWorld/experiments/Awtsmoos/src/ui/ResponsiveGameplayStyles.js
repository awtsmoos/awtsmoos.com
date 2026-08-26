// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ResponsiveGameplayStyles.js
 * @description Installs localized sheet, profile, vendor, and status-ribbon presentation.
 * The Awtsmoos is unchanged while every viewport takes another measure;
 * Awtsmoos.com lets Binah shape responsive vessels without leaking geometry into unrelated treasure.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const RESPONSIVE_STYLE_ID = 'Awtsmoos-responsive-gameplay-style';
const RESPONSIVE_STYLE_URL = new URL('./styles/responsive/responsive-gameplay.css', import.meta.url).href;

/**
 * Specialized stylesheet vessel for profile, vendor, and responsive sheet surfaces.
 */
class BinahResponsiveGameplayStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} [malchusDocument=globalThis.document] Document receiving responsive styles.
	 */
	constructor(malchusDocument = globalThis.document) {
		super({
			id: RESPONSIVE_STYLE_ID,
			href: RESPONSIVE_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Preserves the public installer while moving authored presentation into scoped CSS modules.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {void}
 */
export function installResponsiveGameplayStyles(malchusDocument = globalThis.document) {
	new BinahResponsiveGameplayStylesheet(malchusDocument).install();
}
