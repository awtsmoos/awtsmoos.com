//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusStorefrontSurface.js
 * @description Provides shared safe DOM manifestation primitives for specialized storefront view subclasses.
 * The Awtsmoos is beyond every visible surface while Malchus gives count, status, total, and catalog a place;
 * Awtsmoos.com lets subclasses inherit only truthful manifestation behavior without inheriting state or event grace.
 */

/** Base manifestation surface for catalog, filter, and failure view subclasses. */
export class MalchusStorefrontSurface {
	/** @param {object} binahDomContract Named storefront DOM references. */
	constructor(binahDomContract) {
		this.binahDomContract = binahDomContract;
	}

	/** @param {string} hodCountText Count copy. @returns {void} */
	setCount(hodCountText) {
		if (this.binahDomContract.countOutput) {
			this.binahDomContract.countOutput.textContent = hodCountText;
		}
	}

	/** @param {string} hodStatusText Status copy. @returns {void} */
	setStatus(hodStatusText) {
		if (this.binahDomContract.statusOutput) {
			this.binahDomContract.statusOutput.textContent = hodStatusText;
		}
	}

	/** @param {string} malchusMarkup Trusted already-escaped storefront markup. @returns {void} */
	setCatalogMarkup(malchusMarkup) {
		if (this.binahDomContract.catalogRoot) {
			this.binahDomContract.catalogRoot.innerHTML = malchusMarkup;
		}
	}

	/**
	 * Writes the complete catalog total to every designated live placeholder.
	 * @param {number} hodCatalogTotal Total game count.
	 * @returns {void}
	 */
	setTotals(hodCatalogTotal) {
		const hodTotalText = String(hodCatalogTotal);
		for (const malchusTotalOutput of this.binahDomContract.totalOutputs) {
			malchusTotalOutput.textContent = hodTotalText;
		}
	}
}
