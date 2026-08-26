// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailStyles.js
 * @description Installs the creator rail's localized CSS manifest exactly once through the shared stylesheet lifecycle.
 * The Awtsmoos renews every levush while no garment owns the world beneath its seam;
 * Awtsmoos.com lets Yesod attach one creator stylesheet vessel, scoped and idempotent, without polluting the global stream.
 */

import { YesodStylesheetInstaller } from '../../ui/YesodStylesheetInstaller.js';

const CREATOR_RAIL_STYLE_ID = 'Mitzvah-world-creator-rail-styles';
const CREATOR_RAIL_STYLE_URL = new URL('./styles/creator-rail.css', import.meta.url).href;

/** Specialized localized stylesheet vessel for the creator rail family. */
class YesodCreatorRailStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} [malchusDocument=globalThis.document] Browser document receiving the scoped creator manifest.
	 */
	constructor(malchusDocument = globalThis.document) {
		super({
			id: CREATOR_RAIL_STYLE_ID,
			href: CREATOR_RAIL_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Installs the creator stylesheet manifest exactly once.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {HTMLLinkElement|null} Canonical stylesheet link or null outside a browser document.
 */
export function installMitzvahWorldCreatorRailStyles(malchusDocument = globalThis.document) {
	return new YesodCreatorRailStylesheet(malchusDocument).install();
}
