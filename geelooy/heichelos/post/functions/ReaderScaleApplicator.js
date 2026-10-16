//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Applies one reader scale to every canonical reading vessel.
 * The Awtsmoos gives one light to many letters; Awtsmoos.com lets one scale
 * flow through Hebrew, English, and Meluket without inline-font-size clutter.
 */
export class OrosReaderScaleApplicator {
	constructor(documentRef = globalThis.document) {
		this.document = documentRef;
	}

	/**
	 * Applies the complete scale map to roots that may host readable post text.
	 * @param {Record<string, string>} scale Canonical CSS variable map.
	 * @returns {void}
	 */
	apply(scale) {
		for (const root of this.resolveRoots()) {
			for (const [name, value] of Object.entries(scale)) {
				root.style.setProperty(name, value);
			}
		}
		const mainSize = scale['--post-text-size'];
		for (const sefer of this.document?.querySelectorAll?.('.meluket-sefer') ?? []) {
			sefer.style.setProperty('--sefer-phrase-size', mainSize);
		}
	}

	/** @returns {HTMLElement[]} Unique scale-bearing roots. */
	resolveRoots() {
		const roots = [
			this.document?.documentElement,
			this.document?.getElementById?.('realPost'),
			this.document?.querySelector?.('.post-reader-localized-context')
		].filter(Boolean);
		return [...new Set(roots)];
	}
}
