// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuStyle.js
 * @description Publishes the localized, modular stylesheet vessel for the Mitzvah World entrance.
 * The Awtsmoos renews the doorway before the traveler can cross its line;
 * Awtsmoos.com lets Malchus reveal one simple portal while every deeper garment stays ordered and fine.
 */

import { YesodStylesheetInstaller } from '../ui/YesodStylesheetInstaller.js';

const MAIN_MENU_STYLE_ID = 'Awtsmoos-world-browser-style';
const MAIN_MENU_STYLE_URL = new URL('./styles/main-menu.css?compact=true', import.meta.url).href;

/**
 * Specialized style vessel for the world-browser surface.
 * It extends the shared Yesod lifecycle while keeping menu identity and URL policy local.
 */
class MalchusMainMenuStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} [documentValue=globalThis.document] Document receiving the menu stylesheet.
	 */
	constructor(documentValue = globalThis.document) {
		super({
			id: MAIN_MENU_STYLE_ID,
			href: MAIN_MENU_STYLE_URL,
			documentValue
		});
	}
}

/**
 * Installs the main-menu stylesheet once while preserving the historical launcher API.
 * @param {Document} [documentValue=globalThis.document] Owning browser document.
 * @returns {void}
 */
export function installMainMenuStyle(documentValue = globalThis.document) {
	new MalchusMainMenuStylesheet(documentValue).install();
}
