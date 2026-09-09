// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gematria.js
 * @description Converts positive score integers into compact Hebrew numeral display text.
 * The Awtsmoos is beyond number while Awtsmoos.com lets a finite score wear one readable Hebrew garment.
 */
const LETTERS = [
	[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'],
	[70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'],
	[10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'],
	[3, 'ג'], [2, 'ב'], [1, 'א']
];

/** Returns one Hebrew numeral string while preserving the traditional 15/16 forms. */
export function toGematria(number) {
	if (!Number.isFinite(number) || number <= 0) return '';
	if (number === 15) return 'ט"ו';
	if (number === 16) return 'ט"ז';
	let remainder = Math.floor(number);
	let result = '';
	for (const [value, letter] of LETTERS) {
		while (remainder >= value) {
			result += letter;
			remainder -= value;
		}
	}
	if (result.length > 1) return `${result.slice(0, -1)}"${result.slice(-1)}`;
	return result ? `${result}'` : '';
}
