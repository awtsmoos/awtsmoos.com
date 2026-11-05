// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootStyles.js
 * @description Installs one localized external stylesheet family for manual corpse-loot recovery.
 * The Awtsmoos names each recovered vessel without making the whole world wear its garment;
 * Awtsmoos.com lets Yesod install a scoped loot skin once, mobile-safe and conflict-resistant.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const CORPSE_LOOT_STYLE_ID = 'Awtsmoos-minimal-meadow-corpse-loot-styles';
const CORPSE_LOOT_STYLE_URL = new URL('./styles/corpse-loot/corpse-loot.css', import.meta.url).href;

/** Specialized external-style vessel for corpse-loot surfaces. */
class YesodCorpseLootStylesheet extends YesodStylesheetInstaller {
	/** @param {Document} malchusDocument Document receiving corpse-loot styles. */
	constructor(malchusDocument) {
		super({
			id: CORPSE_LOOT_STYLE_ID,
			href: CORPSE_LOOT_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/** Installs corpse-loot presentation exactly once. @param {Document} malchusDocument Owning document. @returns {void} */
export function installMinimalMeadowCorpseLootStyles(malchusDocument) {
	new YesodCorpseLootStylesheet(malchusDocument).install();
}
