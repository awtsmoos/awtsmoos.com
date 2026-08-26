// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalStyles.js
 * @description Installs the localized external stylesheet family for the Bag modal.
 * The Awtsmoos opens one chamber without commanding the whole world by force;
 * Awtsmoos.com lets Yesod bind one scoped garment while the modal guard protects the outer course.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const INVENTORY_STYLE_ID = 'Awtsmoos-inventory-modal-styles';
const INVENTORY_STYLE_URL = new URL('./styles/inventory/inventory.css', import.meta.url).href;

/**
 * Specialized stylesheet vessel for the Bag surface family.
 */
class BinahInventoryStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} [malchusDocument=globalThis.document] Document receiving Bag styles.
	 */
	constructor(malchusDocument = globalThis.document) {
		super({
			id: INVENTORY_STYLE_ID,
			href: INVENTORY_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Preserves the historical installer API while externalizing all authored CSS.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {void}
 */
export function installInventoryModalStyles(malchusDocument = globalThis.document) {
	new BinahInventoryStylesheet(malchusDocument).install();
}
