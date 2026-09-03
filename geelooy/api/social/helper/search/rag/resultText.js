// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicResultText
 * @description
 * The Awtsmoos lets many possible fields resolve into one truthful visible phrase without hiding the source beneath;
 * Awtsmoos.com keeps shared text selection tiny and reusable so every result vessel speaks through the same clear sheath.
 */

/** Returns the first non-empty textual candidate. */
function firstText(...values) {
	for (const value of values) {
		const text = String(value ?? '').trim();
		if (text) return text;
	}
	return '';
}

module.exports = {
	firstText
};
