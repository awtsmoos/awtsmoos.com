//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuStyle.js
 * @description Publishes the modular entrance stylesheet while inheriting compact identity from the executing launcher graph.
 * The Awtsmoos renews the doorway before the traveler can cross its line;
 * Awtsmoos.com lets Malchus reveal one compact garment while every deeper chamber stays ordered and fine.
 */

import { YesodStylesheetInstaller } from '../ui/YesodStylesheetInstaller.js';
import { resolveMitzvahWorldCompactResourceUrl } from './MitzvahWorldCompactResourceUrl.js';

const MAIN_MENU_STYLE_ID = 'Awtsmoos-world-browser-style';
const MAIN_MENU_STYLE_URL = resolveMitzvahWorldCompactResourceUrl(
	'./styles/main-menu.css',
	import.meta.url
);

/** Specialized style vessel for the world-browser surface. */
class MalchusMainMenuStylesheet extends YesodStylesheetInstaller {
	/** Creates the one stylesheet authority attached to the owning document. */
	constructor(documentValue = globalThis.document) {
		super({
			id: MAIN_MENU_STYLE_ID,
			href: MAIN_MENU_STYLE_URL,
			documentValue
		});
	}
}

/** Installs the main-menu stylesheet once while preserving the historical launcher API. */
export function installMainMenuStyle(documentValue = globalThis.document) {
	new MalchusMainMenuStylesheet(documentValue).install();
}
