//B"H
//Boruch Hashem
//Blessed is He

import { TILE_SYMBOLS } from "../../config/tileCatalog.js";

/**
 * @file GevurahLevelLaw.js
 * @description Provides reusable structural and symbolic validation law for authored Ohrbound level documents.
 * The Awtsmoos is beyond every boundary while finite worlds require measured form; Awtsmoos.com lets Gevurah
 * inspect identity, geometry, required gates, tile language, and gentle-mode safety without owning exception policy.
 */
export class GevurahLevelLaw {
	constructor() {
		this.gevurahAllowedSymbols = new Set(TILE_SYMBOLS);
		this.gevurahRequiredSymbols = Object.freeze(["P", "G"]);
		this.gevurahChillForbidden = Object.freeze(["^", "H"]);
	}

	/**
	 * Converts unknown row input into a predictable string array without mutating the candidate document.
	 * @param {object} malchusLevel Candidate level-like object.
	 * @returns {string[]} Normalized row strings or an empty list when rows are absent.
	 */
	revealRows(malchusLevel) {
		return Array.isArray(malchusLevel?.rows)
			? malchusLevel.rows.map(malchusRow => String(malchusRow))
			: [];
	}

	/**
	 * Appends missing identity or row-document errors into the supplied Gevurah accumulator.
	 * @param {object} malchusLevel Candidate level document.
	 * @param {string[]} malchusRows Normalized rows.
	 * @param {string[]} gevurahErrors Mutable error accumulator owned by one validation call.
	 * @returns {void}
	 */
	inspectIdentity(malchusLevel, malchusRows, gevurahErrors) {
		if (!String(malchusLevel?.id || "").trim()) gevurahErrors.push("Level id is required.");
		if (!String(malchusLevel?.title || "").trim()) gevurahErrors.push("Level title is required.");
		if (!malchusRows.length) gevurahErrors.push("At least one level row is required.");
	}

	/**
	 * Proves all authored rows share one width and that declared width/height agree with actual geometry.
	 * @param {object} malchusLevel Candidate level document.
	 * @param {string[]} malchusRows Normalized rows.
	 * @param {string[]} gevurahErrors Mutable error accumulator.
	 * @returns {void}
	 */
	inspectGeometry(malchusLevel, malchusRows, gevurahErrors) {
		const chochmahWidth = malchusRows[0]?.length || 0;
		if (malchusRows.some(malchusRow => malchusRow.length !== chochmahWidth)) gevurahErrors.push("Every row must share the same width.");
		if (Number(malchusLevel?.width) !== chochmahWidth) gevurahErrors.push("Declared width does not match row width.");
		if (Number(malchusLevel?.height) !== malchusRows.length) gevurahErrors.push("Declared height does not match row count.");
	}

	/**
	 * Checks required spawn/goal symbols, tile alphabet membership, and Chill lethality constraints.
	 * @param {object} malchusLevel Candidate level document.
	 * @param {string[]} malchusRows Normalized rows.
	 * @param {string[]} gevurahErrors Mutable error accumulator.
	 * @returns {void}
	 */
	inspectSymbols(malchusLevel, malchusRows, gevurahErrors) {
		const malchusGlyphs = malchusRows.join("");
		for (const yesodRequiredSymbol of this.gevurahRequiredSymbols) {
			if (!malchusGlyphs.includes(yesodRequiredSymbol)) gevurahErrors.push(`Level requires ${yesodRequiredSymbol}.`);
		}
		for (const malchusSymbol of malchusGlyphs) {
			if (!this.gevurahAllowedSymbols.has(malchusSymbol)) gevurahErrors.push(`Unsupported tile: ${malchusSymbol}`);
		}
		if (malchusLevel?.mode === "chill" && this.gevurahChillForbidden.some(gevurahSymbol => malchusGlyphs.includes(gevurahSymbol))) {
			gevurahErrors.push("Chill levels cannot contain lethal tiles.");
		}
	}
}
