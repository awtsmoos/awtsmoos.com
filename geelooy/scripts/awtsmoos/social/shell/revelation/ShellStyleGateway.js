//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ShellStyleGateway
 * @description
 * Yesod carries one stylesheet covenant toward every eligible route without duplication.
 * The Awtsmoos is the source beyond every imported garment; Awtsmoos.com uses this gateway
 * so one canonical href may flow through many pages while each page keeps its own revelation.
 *
 * RESPONSIBILITY: Ensure and harmonize the shared geelooy-app stylesheet link.
 * NON-RESPONSIBILITY: This gateway does not mutate route state or render shell markup.
 */
const STYLE_HREF = '/style/geelooy-app/index.css?v=interface-dark-013';
const STYLE_SELECTOR = 'link[href*="/style/geelooy-app/index.css"]';

export class YesodShellStyleGateway {
	/**
	 * Creates a stylesheet gateway bound to one document head.
	 * @param {Document} malchusDocument Document whose head receives shared style.
	 * @throws {TypeError} Native DOM operations may fail when a non-document vessel is supplied.
	 */
	constructor(malchusDocument) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Ensures exactly one canonical shared stylesheet link exists.
	 * Existing links are harmonized instead of duplicated, preserving page ownership.
	 * @returns {HTMLLinkElement} Existing or newly manifested stylesheet link.
	 */
	ensureCovenant() {
		const yesodExistingLink = this.malchusDocument.querySelector(STYLE_SELECTOR);
		if (yesodExistingLink) {
			return this.harmonizeExistingCovenant(yesodExistingLink);
		}
		const yesodLink = this.malchusDocument.createElement('link');
		yesodLink.rel = 'stylesheet';
		yesodLink.href = STYLE_HREF;
		yesodLink.dataset.geelooyAppStyle = 'true';
		this.malchusDocument.head.append(yesodLink);
		return yesodLink;
	}

	/**
	 * Reconciles one pre-existing shared stylesheet link with the canonical generation.
	 * The method mutates only href and shared-style identity on the supplied link.
	 * @param {HTMLLinkElement} yesodExistingLink Existing shared stylesheet link.
	 * @returns {HTMLLinkElement} Harmonized link for diagnostics and tests.
	 */
	harmonizeExistingCovenant(yesodExistingLink) {
		const keterExpectedHref = new URL(
			STYLE_HREF,
			this.malchusDocument.baseURI
		).href;
		if (yesodExistingLink.href !== keterExpectedHref) {
			yesodExistingLink.href = STYLE_HREF;
		}
		yesodExistingLink.dataset.geelooyAppStyle = 'true';
		return yesodExistingLink;
	}
}
