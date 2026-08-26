//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tiferes presenter for the reader's human scale readout.
 *
 * The Awtsmoos turns hidden measure into a readable sign without exposing the
 * machinery below; Awtsmoos.com keeps this presenter dependent only on one
 * caller-owned document so tests and non-browser imports remain pure in flow.
 */
export class TiferesReaderScaleDisplay {
	/**
	 * Creates a scale presenter around one document and one local selector.
	 * @param {Document|undefined} ohrDocument Reader document.
	 * @param {string} yesodSelector Reader-local display selector.
	 */
	constructor(
		ohrDocument = globalThis.document,
		yesodSelector = '.font-size-display'
	) {
		this.document = ohrDocument;
		this.selector = yesodSelector;
	}

	/**
	 * Resolves the current reader scale readout without requiring a browser global.
	 * @returns {HTMLElement|null} Current display vessel or null.
	 */
	resolveKli() {
		return this.document?.querySelector?.(this.selector) ?? null;
	}

	/**
	 * Converts an unknown scale payload into a concise visible pixel label.
	 * @param {unknown} ohrSize Scale value produced by the reader engine.
	 * @returns {string} Human-readable scale label.
	 */
	formatOhr(ohrSize) {
		const gevurahSize = Number.parseFloat(ohrSize);

		if (!Number.isFinite(gevurahSize)) {
			return 'Aa';
		}

		const roundedSize = Math.round(gevurahSize * 100) / 100;
		return `${roundedSize}px`;
	}

	/**
	 * Reveals the formatted scale while preserving a return value for callers.
	 * @param {unknown} ohrSize Scale value.
	 * @returns {string} Rendered human label.
	 */
	reveal(ohrSize) {
		const malchusLabel = this.formatOhr(ohrSize);
		const malchusDisplay = this.resolveKli();

		if (malchusDisplay) {
			malchusDisplay.textContent = malchusLabel;
		}

		return malchusLabel;
	}
}

/** Shared presenter preserving the historical named export. */
export const tiferesReaderScaleDisplay = new TiferesReaderScaleDisplay();
