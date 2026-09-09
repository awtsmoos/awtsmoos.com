// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahTitlePresentation
 * @description
 * The Awtsmoos joins Hebrew authority with an English companion while stable IDs remain hidden keilim beneath the public name;
 * Awtsmoos.com resolves canonical registries and numbered Torah families before any humanized fallback can enter the learner's sight.
 */

import {
	englishTitleForHebrew,
	titlePairById,
	titlePairByKnownName
} from './torahTitleRegistry.js?v=torah-bilingual-004';
import { titlePairByPattern } from './torahPatternTitleRegistry.js?v=torah-bilingual-004';
import {
	hasHebrewLetters,
	transliterateTorahTitle
} from './torahTitleTransliteration.js?v=torah-bilingual-002';

const RTL_OPEN = '\u2067';
const LTR_OPEN = '\u2066';
const ISOLATE_CLOSE = '\u2069';

/** Resolves canonical Hebrew, English, display, and provenance kind for one Torah title source. */
export function torahTitlePair(source = {}) {
	const record = typeof source === 'string' ? { name: source } : source || {};
	const key = String(record.titleKey || record.id || '').trim();
	const raw = String(record.name || record.title || '').trim();
	const registered = titlePairById(key)
		|| titlePairByPattern(key)
		|| titlePairByKnownName(raw)
		|| titlePairByPattern(raw);
	const he = String(
		record.titleHe
		|| record.nameHe
		|| registered?.he
		|| (hasHebrewLetters(raw) ? raw : '')
	).trim();
	const explicitEnglish = String(
		record.titleEn
		|| record.nameEn
		|| registered?.en
		|| ''
	).trim();
	const curatedEnglish = he ? englishTitleForHebrew(he) : '';
	const fallbackEnglish = humanizeTorahId(raw || key);
	const en = explicitEnglish
		|| curatedEnglish
		|| (he ? transliterateTorahTitle(he) : fallbackEnglish || 'Torah');
	return {
		he,
		en,
		display: bilingualDisplay(he, en),
		englishKind: englishKind(explicitEnglish, curatedEnglish, registered, he)
	};
}

/** Projects a title pair into the fields consumed by navigation and cards. */
export function torahTitleFields(source = {}) {
	const pair = torahTitlePair(source);
	return {
		titleHe: pair.he,
		titleEn: pair.en,
		titleEnglishKind: pair.englishKind,
		name: pair.display
	};
}

/** Joins Hebrew and English with bidi isolation so punctuation cannot scramble mixed-script titles. */
export function bilingualDisplay(he = '', en = '') {
	if (he && en) {
		return `${RTL_OPEN}${he}${ISOLATE_CLOSE} · ${LTR_OPEN}${en}${ISOLATE_CLOSE}`;
	}
	return he || en || 'Torah';
}

/** Humanizes an unknown stable ID only after every canonical resolver has failed. */
export function humanizeTorahId(value = '') {
	return String(value)
		.replace(/[_-]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/^./, letter => letter.toUpperCase());
}

/** Describes whether English came from authority, transliteration, or last-resort ID humanization. */
function englishKind(explicit, curated, registered, he) {
	if (explicit || curated || registered?.en) {
		return 'canonical';
	}
	return he ? 'transliteration' : 'humanized';
}
