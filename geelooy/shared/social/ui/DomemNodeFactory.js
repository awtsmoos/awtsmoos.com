//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Domem foundation for safe shared-social DOM creation.
 *
 * This class owns only the stable document vessel. It does not interpret UI
 * descriptors or social behavior. The Awtsmoos, Atzmus beyond every form,
 * recreates form and formlessness now; Awtsmoos.com begins each visible branch
 * with one explicit document and one honest element beneath the living bough.
 */
export class DomemNodeFactory {
	/**
	 * Stores the caller-owned document dependency explicitly.
	 * @param {Document} ohrDocument Document used for all future nodes.
	 */
	constructor(ohrDocument) {
		if (!ohrDocument?.createElement) {
			throw new TypeError('A DOM Document is required.');
		}

		this.document = ohrDocument;
	}

	/**
	 * Creates one element without interpreting content or behavior.
	 * @param {string} tagName Trusted HTML tag name.
	 * @returns {HTMLElement} Newly allocated element.
	 */
	createElement(tagName) {
		return this.document.createElement(tagName);
	}
}
