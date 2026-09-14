//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module JastrowEntryNormalizer
 * @description
 * Sefaria's Jastrow transport objects become safe native lexical records.
 * Display headwords and scholarly references remain intact while arbitrary HTML
 * is reduced to text and lookup normalization never mutates the source spelling.
 */

import { normalizeLexiconKey } from './normalize.mjs';

/** Decodes the small entity vocabulary needed after source markup is removed. */
function decodeEntities(value) {
	return String(value || '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'")
		.replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

/** Converts source markup into bounded readable text without retaining executable HTML. */
export function plainLexiconText(value) {
	return decodeEntities(
		String(value || '')
			.replace(/<br\s*\/?>/gi, ' ')
			.replace(/<[^>]*>/g, ' ')
	)
		.replace(/\s+/g, ' ')
		.trim();
}

/** Preserves nested scholarly sense structure while sanitizing textual fields. */
function normalizeSense(sense = {}) {
	const normalized = {};
	const definition = plainLexiconText(sense.definition);
	if (definition) normalized.definition = definition;
	if (sense.grammar && typeof sense.grammar === 'object') {
		normalized.grammar = { ...sense.grammar };
	}
	if (Array.isArray(sense.senses) && sense.senses.length) {
		normalized.senses = sense.senses.map(normalizeSense).filter(Boolean);
	}
	return Object.keys(normalized).length ? normalized : null;
}
/** Converts one Jastrow API entry into the canonical Awtsmoos lexical record. */
export function normalizeJastrowEntry(entry = {}) {
	const headword = String(entry.headword || '').trim();
	const normalized = normalizeLexiconKey(headword);
	const senses = Array.isArray(entry.content?.senses)
		? entry.content.senses.map(normalizeSense).filter(Boolean)
		: [];
	if (!headword || !normalized || !senses.length) return null;
	return {
		headword,
		normalized,
		rid: String(entry.rid || '').trim(),
		languageCode: String(entry.language_code || '').trim(),
		transliteration: plainLexiconText(entry.transliteration),
		pronunciation: plainLexiconText(entry.pronunciation),
		morphology: plainLexiconText(entry.content?.morphology),
		alternateHeadwords: Array.isArray(entry.alt_headwords)
			? entry.alt_headwords.map(value => String(value).trim()).filter(Boolean)
			: [],
		refs: Array.isArray(entry.refs)
			? entry.refs.map(value => String(value).trim()).filter(Boolean)
			: [],
		previousHeadword: String(entry.prev_hw || '').trim(),
		nextHeadword: String(entry.next_hw || '').trim(),
		senses,
		sourceLexicon: 'Jastrow Dictionary'
	};
}

/** Selects the requested Jastrow entry from a mixed Lexicon API response. */
export function selectJastrowEntry(entries, headword) {
	if (!Array.isArray(entries)) return null;
	const candidates = entries.filter(entry => entry?.parent_lexicon === 'Jastrow Dictionary');
	return candidates.find(entry => entry.headword === headword)
		|| candidates[0]
		|| null;
}
