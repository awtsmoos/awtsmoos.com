// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHebrewStrokeAlphabet.js
 * @description Defines readable normalized Hebrew letter strokes for configured combat phrases.
 * The Awtsmoos gives every holy letter a source beyond form; Awtsmoos.com reveals a restrained
 * geometric vessel for fire, light, life, judgment, and impact without fonts or texture uploads.
 */

const FALLBACK = Object.freeze([
	[0.12, 0.12, 0.68, 0.88],
	[0.68, 0.12, 0.12, 0.88]
]);

const STROKES = Object.freeze({
	'א': Object.freeze([
		[0.12, 0.12, 0.68, 0.88],
		[0.62, 0.12, 0.28, 0.88],
		[0.28, 0.52, 0.58, 0.48]
	]),
	'ש': Object.freeze([
		[0.12, 0.88, 0.18, 0.28],
		[0.38, 0.88, 0.4, 0.24],
		[0.66, 0.88, 0.58, 0.28],
		[0.18, 0.28, 0.4, 0.12],
		[0.58, 0.28, 0.4, 0.12]
	]),
	'ו': Object.freeze([
		[0.58, 0.86, 0.34, 0.86],
		[0.5, 0.86, 0.5, 0.16]
	]),
	'ר': Object.freeze([
		[0.16, 0.86, 0.66, 0.86],
		[0.62, 0.86, 0.62, 0.18]
	]),
	'ח': Object.freeze([
		[0.16, 0.86, 0.16, 0.16],
		[0.64, 0.86, 0.64, 0.16],
		[0.16, 0.84, 0.64, 0.84]
	]),
	'י': Object.freeze([
		[0.58, 0.86, 0.38, 0.86],
		[0.54, 0.84, 0.5, 0.58]
	]),
	'ד': Object.freeze([
		[0.12, 0.86, 0.7, 0.86],
		[0.62, 0.86, 0.62, 0.18]
	]),
	'ן': Object.freeze([
		[0.58, 0.86, 0.38, 0.86],
		[0.5, 0.84, 0.5, 0.02]
	]),
	'מ': Object.freeze([
		[0.14, 0.84, 0.66, 0.84],
		[0.64, 0.84, 0.64, 0.16],
		[0.64, 0.16, 0.16, 0.16],
		[0.16, 0.16, 0.16, 0.72],
		[0.16, 0.72, 0.48, 0.34]
	]),
	'כ': Object.freeze([
		[0.16, 0.84, 0.64, 0.84],
		[0.64, 0.84, 0.64, 0.18],
		[0.64, 0.18, 0.18, 0.18]
	]),
	'ה': Object.freeze([
		[0.14, 0.84, 0.66, 0.84],
		[0.64, 0.84, 0.64, 0.16],
		[0.18, 0.68, 0.18, 0.16]
	])
});

export function hebrewStrokePattern(letter) {
	return STROKES[letter] || FALLBACK;
}

export function hebrewStrokeAlphabetDiagnostics() {
	return { configuredLetters: Object.keys(STROKES), fallbackSegments: FALLBACK.length };
}
