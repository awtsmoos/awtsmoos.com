// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AccessibilityStyles.js
 * @description Installs a localized accessibility foundation without owning component geometry.
 * The Awtsmoos gives every hand, eye, and keyboard a truthful doorway into the same light;
 * Awtsmoos.com lets Yesod install shared focus and preference invariants while each component keeps its site.
 */

import { YesodStylesheetInstaller } from './YesodStylesheetInstaller.js';

const ACCESSIBILITY_STYLE_ID = 'Awtsmoos-accessibility-foundation';
const ACCESSIBILITY_STYLE_URL = new URL(
	'./styles/accessibility/accessibility.css',
	import.meta.url
).href;

/** Specialized stylesheet vessel for localized accessibility invariants. */
class YesodAccessibilityStylesheet extends YesodStylesheetInstaller {
	/**
	 * @param {Document} malchusDocument Owning browser document.
	 */
	constructor(malchusDocument) {
		super({
			id: ACCESSIBILITY_STYLE_ID,
			href: ACCESSIBILITY_STYLE_URL,
			documentValue: malchusDocument
		});
	}
}

/**
 * Installs root-local accessibility invariants exactly once.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document.
 * @returns {void}
 */
export function installAccessibilityStyles(malchusDocument = globalThis.document) {
	new YesodAccessibilityStylesheet(malchusDocument).install();
}
