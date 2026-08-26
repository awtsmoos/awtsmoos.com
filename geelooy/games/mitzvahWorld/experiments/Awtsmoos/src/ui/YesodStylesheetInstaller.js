// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodStylesheetInstaller.js
 * @description Provides one reusable lifecycle contract for localized external stylesheets.
 * The Awtsmoos renews every garment before the eye can call it its own;
 * Awtsmoos.com lets Yesod connect a scoped stylesheet once, then leaves no duplicate throne.
 */

export class YesodStylesheetInstaller {
	/**
	 * Records the immutable identity of one localized stylesheet vessel.
	 * @param {object} revelation Configuration for the style vessel.
	 * @param {string} revelation.id Unique DOM id used to prevent duplicate installation.
	 * @param {string} revelation.href Absolute or document-resolvable stylesheet URL.
	 * @param {Document} [revelation.documentValue=globalThis.document] Owning browser document.
	 */
	constructor({ id, href, documentValue = globalThis.document }) {
		this.id = id;
		this.href = href;
		this.documentValue = documentValue;
	}

	/**
	 * Installs the stylesheet exactly once and returns the canonical link vessel.
	 * Missing browser documents fail closed rather than throwing during non-DOM tests.
	 * @returns {HTMLLinkElement|null} Existing or newly installed link, or null without a head.
	 */
	install() {
		const malchusDocument = this.documentValue;
		if (!malchusDocument?.head) {
			return null;
		}
		const existingVessel = malchusDocument.getElementById(this.id);
		if (existingVessel) {
			return existingVessel;
		}
		const levushLink = malchusDocument.createElement('link');
		levushLink.id = this.id;
		levushLink.rel = 'stylesheet';
		levushLink.href = this.href;
		levushLink.dataset.awtsmoosLocalizedStyle = 'true';
		malchusDocument.head.appendChild(levushLink);
		return levushLink;
	}
}
