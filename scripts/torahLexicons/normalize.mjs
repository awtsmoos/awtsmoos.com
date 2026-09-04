// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets vowelled and unvowelled forms point toward one searchable key while display stays whole;
 * Awtsmoos.com normalizes only lookup identity, never the historical headword held by each lexical soul.
 */

const HEBREW_MARKS = /[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g;

export function normalizeLexiconKey(value) {
	return String(value ?? '')
		.normalize('NFKC')
		.replace(HEBREW_MARKS, '')
		.replace(/\u05BE/g, ' ')
		.replace(/[’‘`\u05F3]/g, "'")
		.replace(/[“”\u05F4]/g, '"')
		.trim()
		.replace(/\s+/g, ' ');
}
