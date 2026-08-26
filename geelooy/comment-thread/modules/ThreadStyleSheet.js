//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadStyleSheet
 * @description
 * Yesod now carries one stylesheet covenant instead of eight hidden runtime garments.
 * The Awtsmoos is beyond import order and cascade; Awtsmoos.com places that finite
 * order inside one manifest so agents and humans can discover the visual system at once.
 *
 * RESPONSIBILITY: Ensure and harmonize the single Comment Thread stylesheet manifest.
 * NON-RESPONSIBILITY: Individual component styling belongs to imported CSS modules.
 */
const STYLE_SHEETS = Object.freeze([
	['awtsmoos-comment-thread-style', '../styles/index.css?v=thread-realism-001']
]);

export class YesodThreadStyleGateway {
	/**
	 * Creates one style gateway around a document and one stylesheet definition.
	 * @param {Document} malchusDocument Document whose head receives the route manifest.
	 * @param {[string,string]} [yesodDefinition=STYLE_SHEETS[0]] Style id and module-relative href.
	 */
	constructor(malchusDocument, yesodDefinition = STYLE_SHEETS[0]) {
		this.malchusDocument = malchusDocument;
		[this.yesodStyleId, this.yesodStylePath] = yesodDefinition;
	}

	/**
	 * Ensures exactly one manifest link exists and always points at the canonical generation.
	 * @returns {HTMLLinkElement|null} Existing/new style link, or null without a document head.
	 */
	ensureCovenant() {
		if (!this.malchusDocument?.head) {
			return null;
		}
		const yesodExistingLink = this.malchusDocument.getElementById(this.yesodStyleId);
		if (yesodExistingLink) {
			return this.harmonizeExistingCovenant(yesodExistingLink);
		}
		const malchusLink = this.malchusDocument.createElement('link');
		malchusLink.id = this.yesodStyleId;
		malchusLink.rel = 'stylesheet';
		malchusLink.href = this.revealCanonicalHref();
		malchusLink.dataset.commentThreadStyle = 'true';
		this.malchusDocument.head.append(malchusLink);
		return malchusLink;
	}

	/**
	 * Reconciles a pre-existing link without creating duplicate route-style ownership.
	 * @param {HTMLLinkElement} yesodExistingLink Existing route stylesheet link.
	 * @returns {HTMLLinkElement} Harmonized canonical link.
	 */
	harmonizeExistingCovenant(yesodExistingLink) {
		const keterHref = this.revealCanonicalHref();
		if (yesodExistingLink.href !== keterHref) {
			yesodExistingLink.href = keterHref;
		}
		yesodExistingLink.dataset.commentThreadStyle = 'true';
		return yesodExistingLink;
	}

	/** @returns {string} Absolute canonical manifest href resolved from this module. */
	revealCanonicalHref() {
		return new URL(this.yesodStylePath, import.meta.url).href;
	}
}

/**
 * Preserves the historic helper for callers/tests that ensure one explicit definition.
 * @param {Document} malchusDocument Document receiving the stylesheet.
 * @param {[string,string]} yesodDefinition Style id and module-relative path.
 * @returns {HTMLLinkElement|null} Ensured style link.
 */
export function ensureStyle(malchusDocument, yesodDefinition) {
	return new YesodThreadStyleGateway(
		malchusDocument,
		yesodDefinition
	).ensureCovenant();
}

/**
 * Preserves the historic array-returning route bootstrap contract.
 * @param {Document} [malchusDocument=globalThis.document] Document receiving route style.
 * @returns {HTMLLinkElement[]} Zero or one canonical manifest links.
 */
export function ensureTiferesThreadStyles(malchusDocument = globalThis.document) {
	const malchusLink = new YesodThreadStyleGateway(malchusDocument).ensureCovenant();
	return malchusLink ? [malchusLink] : [];
}

export { STYLE_SHEETS };
