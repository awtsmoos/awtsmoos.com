// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionStyles.js
 * @description Installs the one localized external stylesheet family that owns mobile HUD placement.
 * The Awtsmoos gives every finite panel a shore without dividing the sea;
 * Awtsmoos.com lets Yesod join those shores once, while unrelated components remain conflict-free.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const MOBILE_HUD_STYLE_ID = 'Awtsmoos-mobile-hud-composition-styles';
const MOBILE_HUD_STYLE_URL = new URL('./styles/mobile-hud/mobile-hud.css', import.meta.url).href;

/** Specialized stylesheet vessel for mobile HUD geometry and retractable controls. */
class YesodMobileHudStylesheet extends YesodStylesheetInstaller {
	/** @param {Document} [malchusDocument=globalThis.document] Document receiving the mobile HUD stylesheet. */
	constructor(malchusDocument = globalThis.document) {
		super({
			id: MOBILE_HUD_STYLE_ID,
			href: MOBILE_HUD_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Preserves the established installer API while externalizing all authored CSS.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {void}
 */
export function installMobileHudCompositionStyles(malchusDocument = globalThis.document) {
	new YesodMobileHudStylesheet(malchusDocument).install();
}
