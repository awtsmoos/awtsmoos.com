// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HebrewPhonetics
 * @description The Awtsmoos lets visible letters and nekudos disclose a readable
 * Latin sound while unpointed words remain clearly marked as approximation.
 */
const LETTERS = {
	'א': '', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
	'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'ch', 'ך': 'ch', 'ל': 'l',
	'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '',
	'פ': 'f', 'ף': 'f', 'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r',
	'ש': 'sh', 'ת': 't'
};
const DAGESH_FORMS = { 'ב': 'b', 'כ': 'k', 'ך': 'k', 'פ': 'p', 'ף': 'p' };
const VOWELS = {
	'\u05B0': 'e', '\u05B1': 'e', '\u05B2': 'a', '\u05B3': 'o',
	'\u05B4': 'i', '\u05B5': 'ei', '\u05B6': 'e', '\u05B7': 'a',
	'\u05B8': 'a', '\u05B9': 'o', '\u05BA': 'o', '\u05BB': 'u',
	'\u05C7': 'o'
};
const HEBREW_LETTER = /[\u05D0-\u05EA]/u;
const NEKUDAH = /[\u05B0-\u05BB\u05C7]/u;
const CANTILLATION = /[\u0591-\u05AF]/gu;

function hasMark(marks, mark) {
	return marks.includes(mark);
}

function letterSound(group, context) {
	const { letter, marks } = group;
	if (letter === 'ש') {
		return hasMark(marks, '\u05C2') ? 's' : 'sh';
	}
	if (letter === 'ו' && (hasMark(marks, '\u05B9') || hasMark(marks, '\u05BA'))) {
		return '';
	}
	if (letter === 'ו' && hasMark(marks, '\u05BC') && !marks.some(mark => VOWELS[mark])) {
		return 'u';
	}
	if (letter === 'י' && !marks.some(mark => VOWELS[mark])) {
		return context.previousVowel === 'i' || context.previousVowel === 'ei' ? '' : 'y';
	}
	if (letter === 'ה' && context.isFinal && !hasMark(marks, '\u05BC')) {
		return '';
	}
	if (DAGESH_FORMS[letter] && hasMark(marks, '\u05BC')) {
		return DAGESH_FORMS[letter];
	}
	return LETTERS[letter] ?? '';
}

function vowelSound(group) {
	const { letter, marks } = group;
	if (letter === 'ו' && hasMark(marks, '\u05BC') && !marks.some(mark => VOWELS[mark])) {
		return '';
	}
	const vowel = marks.find(mark => VOWELS[mark]);
	return vowel ? VOWELS[vowel] : '';
}

function letterGroups(value) {
	const groups = [];
	for (const character of value.normalize('NFD').replace(CANTILLATION, '')) {
		if (HEBREW_LETTER.test(character)) {
			groups.push({ letter: character, marks: [] });
			continue;
		}
		if (groups.length > 0 && /[\u0591-\u05C7]/u.test(character)) {
			groups.at(-1).marks.push(character);
		}
	}
	return groups;
}

function readGroups(groups) {
	let previousVowel = '';
	return groups.map((group, index) => {
		const vowel = vowelSound(group);
		const consonant = letterSound(group, {
			isFinal: index === groups.length - 1,
			previousVowel
		});
		previousVowel = vowel;
		return `${consonant}${vowel}`;
	}).join('');
}

export function transliterateHebrew(value) {
	const source = String(value ?? '').trim();
	const groups = letterGroups(source);
	const hasNekudos = groups.some(group => group.marks.some(mark => NEKUDAH.test(mark)));
	const text = readGroups(groups).replace(/yy/g, 'y').replace(/vv/g, 'v').trim();
	return { text: text || source, hasNekudos, approximate: !hasNekudos };
}

export function transliteratePhrase(words) {
	const values = Array.isArray(words) ? words : String(words ?? '').split(/\s+/);
	const results = values.filter(Boolean).map(transliterateHebrew);
	return {
		text: results.map(result => result.text).join(' '),
		hasNekudos: results.some(result => result.hasNekudos),
		approximate: results.some(result => result.approximate)
	};
}
