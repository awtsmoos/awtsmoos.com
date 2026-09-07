// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahTitlePresentation
 * @description
 * The Awtsmoos joins Hebrew authority with an English companion while stable IDs remain hidden keilim beneath the public name;
 * Awtsmoos.com now recognizes canonical legacy routes and humanizes unknown keys, so camelCase can never become a Torah heading.
 */

import {
	englishTitleForHebrew,
	titlePairById,
	titlePairByKnownName
} from './torahTitleRegistry.js?v=torah-bilingual-003';
import {
	hasHebrewLetters,
	transliterateTorahTitle
} from './torahTitleTransliteration.js?v=torah-bilingual-002';

const RTL_OPEN = '\u2067';
const LTR_OPEN = '\u2066';
const ISOLATE_CLOSE = '\u2069';

export function torahTitlePair(source = {}) {
	const record = typeof source === 'string'
		? { name: source }
		: source || {};
	const key = String(record.titleKey || record.id || '').trim();
	const raw = String(record.name || record.title || '').trim();
	const registered = titlePairById(key)
		|| titlePairByKnownName(raw);
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
	const curatedEnglish = he
		? englishTitleForHebrew(he)
		: '';
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

export function torahTitleFields(source = {}) {
	const pair = torahTitlePair(source);
	return {
		titleHe: pair.he,
		titleEn: pair.en,
		titleEnglishKind: pair.englishKind,
		name: pair.display
	};
}

export function bilingualDisplay(he = '', en = '') {
	if (he && en) {
		return `${RTL_OPEN}${he}${ISOLATE_CLOSE} · ${LTR_OPEN}${en}${ISOLATE_CLOSE}`;
	}
	return he || en || 'Torah';
}

export function humanizeTorahId(value = '') {
	return String(value)
		.replace(/[_-]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/^./, letter => letter.toUpperCase());
}

function englishKind(explicit, curated, registered, he) {
	if (explicit || curated || registered?.en) {
		return 'canonical';
	}
	return he
		? 'transliteration'
		: 'humanized';
}
