//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BinahStorefrontDomContract.js
 * @description Resolves the Games hub's named DOM vessels into one immutable contract for view and event layers.
 * The Awtsmoos is beyond every element while Binah gives each finite node a responsibility and name;
 * Awtsmoos.com removes generic element bags so future views can expand without guessing which reference means the same.
 */

/**
 * Reads and validates the storefront's stable DOM surface from one document boundary.
 */
export class BinahStorefrontDomContract {
	/** @param {Document} [binahDocument=globalThis.document] Games hub document. */
	constructor(binahDocument = globalThis.document) {
		this.binahDocument = binahDocument;
	}

	/**
	 * Resolves named references used by the storefront while preserving optional output tolerance.
	 *
	 * @returns {object} Frozen named DOM contract suitable for presentation and interaction layers.
	 */
	read() {
		return Object.freeze({
			catalogRoot: this.binahDocument.getElementById('gamesCatalog'),
			searchInput: this.binahDocument.getElementById('gameSearch'),
			countOutput: this.binahDocument.getElementById('gameCount'),
			tagCloud: this.binahDocument.getElementById('tagCloud'),
			statusOutput: this.binahDocument.getElementById('catalogStatus'),
			totalOutputs: Object.freeze(Array.from(
				this.binahDocument.querySelectorAll('[data-catalog-total]')
			))
		});
	}
}

/**
 * Normalizes the historical DOM bag into the new named contract without changing old constructor callers.
 *
 * Architectural role: compatibility translation only; new code should use `BinahStorefrontDomContract.read()` directly.
 * @param {object} chochmahDomShape Legacy or named DOM reference bag.
 * @returns {object} Frozen named DOM contract.
 */
export function normalizeBinahStorefrontDomContract(chochmahDomShape) {
	if ('catalogRoot' in chochmahDomShape) {
		return Object.freeze(chochmahDomShape);
	}

	return Object.freeze({
		catalogRoot: chochmahDomShape.catalog || null,
		searchInput: chochmahDomShape.search || null,
		countOutput: chochmahDomShape.count || null,
		tagCloud: chochmahDomShape.tags || null,
		statusOutput: chochmahDomShape.status || null,
		totalOutputs: Object.freeze(Array.from(chochmahDomShape.totalCounts || []))
	});
}
