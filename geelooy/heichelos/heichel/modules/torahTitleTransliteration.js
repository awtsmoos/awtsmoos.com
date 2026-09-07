// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahTitleTransliteration
 * @description
 * The Awtsmoos lets an untranslated Hebrew title cross into Latin letters without pretending a new Torah meaning was born;
 * Awtsmoos.com uses this deterministic fallback only when no curated English companion can be faithfully drawn.
 */

const LETTERS = Object.freeze({
	א: '', ב: 'b', ג: 'g', ד: 'd', ה: 'h', ו: 'v', ז: 'z', ח: 'ch', ט: 't',
	י: 'y', כ: 'kh', ך: 'kh', ל: 'l', מ: 'm', ם: 'm', נ: 'n', ן: 'n', ס: 's',
	ע: 'a', פ: 'p', ף: 'f', צ: 'tz', ץ: 'tz', ק: 'k', ר: 'r', ש: 'sh', ת: 't'
});

const HEBREW_MARKS = /[\u0591-\u05C7]/g;
const HEBREW_LETTER = /[\u05D0-\u05EA]/;

/**
 * Creates a stable Latin-script companion without claiming semantic translation.
 * @param {string} source Hebrew title.
 * @returns {string} Readable transliteration fallback.
 */
export function transliterateTorahTitle(source = '') {
	const clean = String(source)
		.normalize('NFKD')
		.replace(HEBREW_MARKS, '');
	const revealed = [...clean]
		.map(transliterateCharacter)
		.join('')
		.replace(/\s+/g, ' ')
		.trim();
	return revealed || 'Torah';
}

/** Returns whether a title contains Hebrew letters requiring a companion. */
export function hasHebrewLetters(source = '') {
	return HEBREW_LETTER.test(String(source));
}

function transliterateCharacter(character) {
	if (Object.prototype.hasOwnProperty.call(LETTERS, character)) {
		return LETTERS[character];
	}
	return character;
}
