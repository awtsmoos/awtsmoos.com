//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BdbEntryNormalizer
 * @description
 * One complete BDB XML entry becomes a safe canonical lexical record. Source
 * markup is transient evidence only; display text, definitions, references, and
 * grammatical labels are normalized into ordinary fields before native storage.
 */

import { normalizeLexiconKey } from './normalize.mjs';
import { plainText } from './plain-text.mjs';

/** Reads one quoted XML attribute without interpreting arbitrary markup. */
function attribute(fragment, name) {
	const match = fragment.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
	return match ? plainText(match[1]) : '';
}

/** Collects sanitized textual contents from every matching XML element. */
function elements(fragment, tag) {
	const expression = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
	return [...fragment.matchAll(expression)]
		.map(match => plainText(match[1]))
		.filter(Boolean);
}

/** Collects canonical source references from BDB ref attributes. */
function references(fragment) {
	return [...fragment.matchAll(/<ref\b[^>]*\br="([^"]+)"[^>]*>/gi)]
		.map(match => plainText(match[1]))
		.filter(Boolean);
}

/** Converts one BDB XML entry fragment into the canonical native lexical schema. */
export function normalizeBdbEntry(fragment) {
	const headword = elements(fragment, 'w')[0] || '';
	const normalized = normalizeLexiconKey(headword);
	const sourceId = attribute(fragment, 'id');
	const definitions = elements(fragment, 'def');
	if (!headword || !normalized || !sourceId) return null;
	return {
		headword,
		normalized,
		sourceId,
		partOfSpeech: elements(fragment, 'pos').join(' · '),
		senses: definitions.map(definition => ({ definition })),
		refs: references(fragment),
		sourceLexicon: 'Brown-Driver-Briggs Hebrew Lexicon'
	};
}
