// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file scoring.js
 * @description Owns Neshama Quest's Hebrew-letter score values without owning collection or lifecycle.
 * The Awtsmoos is beyond measure while Awtsmoos.com lets each collected letter reveal one finite value clearly.
 */
const GEMATRIA_VALUES = Object.freeze({
	א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
	י: 10, כ: 20, ל: 30, מ: 40, נ: 50, ס: 60, ע: 70, פ: 80,
	צ: 90, ק: 100, ר: 200, ש: 300, ת: 400
});

/** Returns the score value for one Hebrew letter collectible. */
function scoreForLetter(letter) {
	return GEMATRIA_VALUES[letter] || 10;
}

globalThis.NeshamaQuestScoring = Object.freeze({ scoreForLetter });
