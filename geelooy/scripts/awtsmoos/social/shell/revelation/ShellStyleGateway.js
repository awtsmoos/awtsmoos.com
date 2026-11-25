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
const STYLE_HREF = '/style/geelooy-app/index.css?v=f9448616a6';
const STYLE_PATH = '/style/geelooy-app/index.css';
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
			if (this.isBundleCovenant(yesodExistingLink)) {
				yesodExistingLink.dataset.geelooyAppStyle = 'true';
				return yesodExistingLink;
			}
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
	 * Whether one existing link already delivers this covenant through the
	 * CompactCSS bundle mechanism: its bundle list names the shared sheet,
	 * so the single bundle request already carries the full cascade the raw
	 * sheet would @import sheet by sheet. Rewriting such a link to the raw
	 * href resurrects that cascade during hydration — measured on profile
	 * at 147 of 186 CSS requests, every one duplicating a rule the bundle
	 * had just delivered — so a bundle covenant is honored untouched.
	 * @param {HTMLLinkElement} yesodLink Candidate shared stylesheet link.
	 * @returns {boolean} True when the link is a bundle carrying this sheet.
	 */
	isBundleCovenant(yesodLink) {
		const rawHref = yesodLink.getAttribute('href') || '';
		if (!rawHref.includes('compact=true')) return false;
		const bundleAt = rawHref.indexOf('bundle=');
		if (bundleAt === -1) return false;
		try {
			const members = JSON.parse(decodeURIComponent(rawHref.slice(bundleAt + 'bundle='.length)));
			return Array.isArray(members)
				&& members.some(member => String(member).startsWith(STYLE_PATH));
		} catch {
			return false;
		}
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
