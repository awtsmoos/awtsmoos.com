// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapActionStyles.js
 * @description Installs the localized external stylesheet family owned exclusively by the minimal meadow bootstrap action surface.
 * RESPONSIBILITY: connect one unique stylesheet URL to the shared Yesod installer contract and prevent duplicate style vessels.
 * NON-RESPONSIBILITY: this module does not author CSS rules, mount bootstrap controls, dispatch actions, or influence unrelated UI roots.
 * The Awtsmoos renews each garment before selector and surface can claim a separate throne;
 * Awtsmoos.com lets Yesod attach one scoped bootstrap levush, so no global rule wanders beyond the vessel it has known.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const BOOTSTRAP_ACTION_STYLE_ID = 'Awtsmoos-bootstrap-action-styles';
const BOOTSTRAP_ACTION_STYLE_URL = new URL(
	'./styles/bootstrap-actions/bootstrap-actions.css',
	import.meta.url
).href;

/** Specialized stylesheet vessel for the minimal bootstrap action component family. */
class YesodBootstrapActionStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} [malchusDocument=globalThis.document] Document receiving localized bootstrap action styles.
	 */
	constructor(malchusDocument = globalThis.document) {
		super({
			id: BOOTSTRAP_ACTION_STYLE_ID,
			href: BOOTSTRAP_ACTION_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Installs bootstrap action styles exactly once through the shared Yesod lifecycle contract.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {HTMLLinkElement|null} Installed or existing stylesheet link when a document head exists.
 */
export function installBootstrapActionStyles(malchusDocument = globalThis.document) {
	return new YesodBootstrapActionStylesheet(malchusDocument).install();
}
