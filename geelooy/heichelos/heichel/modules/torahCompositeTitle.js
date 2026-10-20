//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module TorahCompositeTitle
 * @description
 * The Awtsmoos records some series names as one composite string —
 * "English | Transliteration / Hebrew" (e.g. the Mishneh Torah book
 * series: "The Book of Knowledge | Sefer Hamada / ספר המדע"). A title
 * presenter that merely checks whether such a string CONTAINS Hebrew
 * letters will adopt the whole composite as its "Hebrew" title and a
 * transliteration of the whole composite as its "English" title,
 * printing the name twice with a leading "/". This module splits the
 * composite back into its honest parts so the presenter can join the
 * true Hebrew and the true English exactly once.
 */

import { hasHebrewLetters } from './torahTitleTransliteration.js?v=torah-bilingual-002';

/**
 * Strips internal ID prefixes from a display string, mirroring the
 * presentation module's stripper: "נח-BH-torahOhr" → "נח".
 * @param {string} value Raw title text.
 * @returns {string} Text without BH- id fragments or edge separators.
 */
function stripIdPrefix(value = '') {
	return String(value)
		.replace(/-?BH-[a-zA-Z0-9_-]+/g, '')
		.replace(/^[-_\s]+|[-_\s]+$/g, '')
		.trim();
}

/**
 * Extracts the Hebrew segment of a composite title: the "/" segment
 * carrying Hebrew letters, cut from its first Hebrew letter onward so
 * no Latin head or separator can ride into the Hebrew title.
 * @param {string} value Raw composite or plain title.
 * @returns {string} Hebrew-only segment, or '' when none exists.
 */
export function compositeHebrewSegment(value = '') {
	const clean = stripIdPrefix(value);
	if (!hasHebrewLetters(clean)) return '';
	const segment = clean
		.split('/')
		.map(part => part.trim())
		.find(part => hasHebrewLetters(part)) || clean;
	const start = segment.search(/[\u0590-\u05FF]/);
	if (start < 0) return '';
	return segment
		.slice(start)
		.replace(/[\s|·•–—-]+$/g, '')
		.trim();
}

/**
 * Extracts the English head of a composite title: the text before the
 * first "|" in the segment before the first "/" ("The Book of
 * Knowledge" out of "The Book of Knowledge | Sefer Hamada / ספר המדע").
 * @param {string} value Raw composite or plain title.
 * @returns {string} English head, or '' when it is not Latin text.
 */
export function compositeEnglishHead(value = '') {
	const clean = stripIdPrefix(value);
	const head = (clean.split('/')[0] || '').split('|')[0].trim();
	return head && !hasHebrewLetters(head) ? head : '';
}
