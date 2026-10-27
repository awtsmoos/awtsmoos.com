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
	parshaTitleByHebrew,
	parshaTitleById
} from './torahParshaTitleRegistry.js?v=torah-parsha-001';
import {
	hasHebrewLetters,
	transliterateTorahTitle
} from './torahTitleTransliteration.js?v=torah-bilingual-002';
import {
	compositeEnglishHead,
	compositeHebrewSegment
} from './torahCompositeTitle.js?v=torah-bilingual-004';

const RTL_OPEN = '\u2067';
const LTR_OPEN = '\u2066';
const ISOLATE_CLOSE = '\u2069';

/**
 * What each Likkutei Sichos volume covers, in the book's own terms.
 * Mirror of the mapping in geelooy/api/social/helper/books/seriesTree.js
 * (that helper is CommonJS for the social books feature and cannot be
 * imported by this shared browser/server module, so the mapping lives
 * here too — keep the two in sync). Volumes 1 and 3 each carry one
 * talk per parsha for Bereishis, Shemos and Vayikra; volumes 2 and 4
 * do the same for Bamidbar and Devarim. From volume 5 on, each volume
 * covers a single Chumash, cycling Bereishis, Shemos, Vayikra,
 * Bamidbar, Devarim.
 */
const LIKKUTEI_SICHOS_BOOKS = [
	'Bereishis', 'Shemos', 'Vayikra', 'Bamidbar', 'Devarim'
];

function likkuteiSichosSubtitle(volume) {
	if (volume === 1 || volume === 3) return 'Bereishis–Vayikra';
	if (volume === 2 || volume === 4) return 'Bamidbar–Devarim';
	if (volume >= 5) return LIKKUTEI_SICHOS_BOOKS[(volume - 5) % 5];
	return null;
}

/** Appends the covered books to a Likkutei Sichos volume's English title. */
function withLikkuteiSichosBooks(key, raw, en) {
	if (!en || en.includes('(')) return en;
	const match = String(key || '').match(/^likkuteiSichosVolume(\d+)$/i)
		|| String(raw || '').match(/Likkutei Sichos,?\s+Volume\s+(\d+)/i)
		|| String(raw || '').match(/Likkutei Sichos,?\s+Vol\.?\s+(\d+)/i);
	if (!match) return en;
	const subtitle = likkuteiSichosSubtitle(Number(match[1]));
	return subtitle ? `${en} (${subtitle})` : en;
}

/** Resolves canonical Hebrew, English, display, and provenance kind for one Torah title source. */
export function torahTitlePair(source = {}) {
	const record = typeof source === 'string' ? { name: source } : source || {};
	const key = String(record.titleKey || record.id || '').trim();
	const raw = String(record.name || record.title || '').trim();
	const registered = titlePairById(key)
		|| titlePairByPattern(key)
		|| parshaTitleFromId(key)
		|| titlePairByKnownName(raw)
		|| titlePairByPattern(raw)
		|| parshaTitleFromId(raw)
		|| parshaTitleByHebrew(raw);
	const he = String(
		record.titleHe
		|| record.nameHe
		|| registered?.he
		|| compositeHebrewSegment(raw)
	).trim();
	const explicitEnglish = String(
		record.titleEn
		|| record.nameEn
		|| registered?.en
		|| ''
	).trim();
	const curatedEnglish = he ? englishTitleForHebrew(he) : '';
	const fallbackEnglish = he ? '' : humanizeTorahId(stripIdPrefix(raw) || key);
	// B"H — a composite record name ("English | Transliteration / Hebrew")
	// carries its own English head; it outranks a machine transliteration
	// of the Hebrew, which is only a last resort.
	const compositeEnglish = compositeEnglishHead(raw);
	const en = withLikkuteiSichosBooks(key, raw, explicitEnglish
		|| curatedEnglish
		|| compositeEnglish
		|| (he ? parshaEnglishForHebrew(he) || transliterateTorahTitle(he) : fallbackEnglish || 'Torah'));
	return {
		he,
		en,
		display: bilingualDisplay(he, en),
		englishKind: englishKind(explicitEnglish, curatedEnglish || compositeEnglish, registered, he)
	};
}

/**
 * B"H — Resolves BH-<work>-<parsha> IDs to canonical parsha names.
 * Strips the work prefix and looks up the parsha fragment.
 * Never leaks the raw ID into the display.
 */
function parshaTitleFromId(id = '') {
	const clean = String(id).trim();
	// BH-torahOhr-nch → nch → Noach
	const bhMatch = clean.match(/^BH-[a-zA-Z]+-(.+)$/);
	if (bhMatch) {
		const fragment = stripIdPrefix(bhMatch[1]);
		const pair = parshaTitleById(fragment) || parshaTitleByHebrew(fragment);
		if (pair) return pair;
	}
	// Direct parsha fragment (e.g. "nch" alone)
	const direct = parshaTitleById(clean);
	if (direct) return direct;
	return null;
}

/**
 * B"H — Strips internal ID prefixes from a display string.
 * "נח-BH-torahOhr" → "נח", "BH-torahOhr-nch" → "" (handled by parshaTitleFromId).
 */
function stripIdPrefix(value = '') {
	return String(value)
		.replace(/-?BH-[a-zA-Z0-9_-]+/g, '')
		.replace(/^[-_\s]+|[-_\s]+$/g, '')
		.trim();
}

/**
 * B"H — Gets proper English for a Hebrew parsha name.
 * Uses the canonical registry, not mechanical transliteration.
 */
function parshaEnglishForHebrew(hebrew = '') {
	const pair = parshaTitleByHebrew(String(hebrew).trim());
	return pair ? pair.en : '';
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
