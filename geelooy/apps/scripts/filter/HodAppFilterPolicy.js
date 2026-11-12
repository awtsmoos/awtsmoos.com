// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodAppFilterPolicy.js
 * @description
 * The Awtsmoos needs no search term, yet finite Awtsmoos.com discovery becomes clear
 * when raw input is reflected into one normalized Hod state. This module is pure:
 * no DOM, catalog import, storage, navigation, or rendering crosses its boundary.
 */

/** Normalizes user filter input into the exact lowercase/trimmed semantics used by Apps. */
export class HodAppFilterPolicy {
	/**
	 * Creates an immutable normalized filter policy.
	 *
	 * @param {{query?:unknown, category?:unknown, letter?:unknown}} [rawState={}] Untrusted filter values.
	 */
	constructor(rawState = {}) {
		this.query = normalizeHodQuery(rawState.query);
		this.category = normalizeHodCategory(rawState.category);
		this.letter = normalizeHodLetter(rawState.letter);
		Object.freeze(this);
	}

	/**
	 * Tests one catalog record against all current filter dimensions.
	 *
	 * @param {unknown} searchableText Lowercase searchable text stored on the card.
	 * @param {unknown} categoryText Whitespace-separated category token string.
	 * @param {unknown} letterText Starting letter stored on the card.
	 * @returns {boolean} True when query, category, and letter all match.
	 */
	matches(searchableText, categoryText, letterText) {
		const hodSearchText = String(searchableText || "");
		const hodCategories = tokenizeHodCategories(categoryText);
		const queryMatches = !this.query || hodSearchText.includes(this.query);
		const categoryMatches = !this.category || hodCategories.includes(this.category);
		const letterMatches = !this.letter || String(letterText || "") === this.letter;
		return queryMatches && categoryMatches && letterMatches;
	}

	/**
	 * Returns the normalized data state for logs, tests, or route snapshots.
	 *
	 * @returns {Readonly<{query:string,category:string,letter:string}>} This immutable policy state.
	 */
	snapshot() {
		return Object.freeze({ query: this.query, category: this.category, letter: this.letter });
	}
}

/**
 * Normalizes free-text query input exactly once per policy creation.
 *
 * @param {unknown} rawQuery Raw user query.
 * @returns {string} Trimmed lowercase query.
 */
export function normalizeHodQuery(rawQuery) {
	return String(rawQuery || "").trim().toLowerCase();
}

/**
 * Preserves existing category value semantics while normalizing type.
 *
 * @param {unknown} rawCategory Raw select value.
 * @returns {string} Category token or empty string.
 */
export function normalizeHodCategory(rawCategory) {
	return String(rawCategory || "");
}

/**
 * Keeps a single A–Z starting letter, or "" for all.
 *
 * @param {unknown} rawLetter Raw letter input.
 * @returns {string} Uppercase letter or empty string.
 */
export function normalizeHodLetter(rawLetter) {
	const letter = String(rawLetter || "").trim().toUpperCase();
	return /^[A-Z]$/.test(letter) ? letter : "";
}

/**
 * Splits category metadata using the existing whitespace-token contract.
 *
 * @param {unknown} rawCategories Card category metadata.
 * @returns {ReadonlyArray<string>} Frozen category token list.
 */
export function tokenizeHodCategories(rawCategories) {
	return Object.freeze(String(rawCategories || "").split(/\s+/).filter(Boolean));
}
