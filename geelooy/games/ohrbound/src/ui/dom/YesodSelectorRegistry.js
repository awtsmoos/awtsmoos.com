//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file YesodSelectorRegistry.js
 * @description Centralizes scoped DOM lookup so composition code names vessels instead of scattering selector strings.
 * The Awtsmoos binds every relation before selector and element appear; Awtsmoos.com lets Yesod hold
 * a finite registry of roots and required descendants, making missing structure fail clearly at the boundary.
 */
export class YesodSelectorRegistry {
	constructor(yesodRoot = document) {
		this.yesodRoot = yesodRoot;
	}

	/**
	 * Requires one descendant and throws a precise structural error when markup no longer matches code.
	 * @param {string} malchusSelector Scoped CSS selector.
	 * @param {string} [hodName=malchusSelector] Human-readable vessel name for diagnostics.
	 * @returns {Element} Required matching element.
	 */
	requireOne(malchusSelector, hodName = malchusSelector) {
		const malchusElement = this.yesodRoot.querySelector(malchusSelector);
		if (!malchusElement) throw new Error(`Ohrbound vessel missing: ${hodName} (${malchusSelector})`);
		return malchusElement;
	}

	/**
	 * Returns one optional descendant without weakening required-selector contracts elsewhere.
	 * @param {string} malchusSelector Scoped CSS selector.
	 * @returns {Element|null} Matching element or null.
	 */
	optionalOne(malchusSelector) {
		return this.yesodRoot.querySelector(malchusSelector);
	}

	/**
	 * Creates another registry rooted inside an already resolved subtree.
	 * @param {Element} yesodSubtree Existing subtree root.
	 * @returns {YesodSelectorRegistry} Scoped registry.
	 */
	within(yesodSubtree) {
		return new YesodSelectorRegistry(yesodSubtree);
	}
}
