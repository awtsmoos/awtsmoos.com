//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module KaikkiYiddishEntry
 * @description
 * One transient Wiktextract transport object becomes a bounded Yiddish lexical
 * record. Only reviewed lexical fields survive; the external serialization and
 * provider-specific bulk structure never become native corpus authority.
 */

import { normalizeLexiconKey } from './normalize.mjs';
import { plainText } from './plain-text.mjs';

/** Returns a bounded unique list of safe text values. */
function uniqueText(values, maximum = 24) {
	return [...new Set((values || []).map(plainText).filter(Boolean))].slice(0, maximum);
}

/** Converts one upstream sense into the learner-facing canonical sense shape. */
function normalizeSense(sense = {}) {
	const glosses = uniqueText(sense.glosses || sense.raw_glosses, 12);
	if (!glosses.length) return null;
	return {
		definition: glosses.join('; '),
		tags: uniqueText(sense.tags, 12)
	};
}

/** Selects a stable upstream identity without persisting the transport line. */
function sourceIdentity(entry, sequence) {
	const senseId = entry?.senses?.find(sense => sense?.id)?.id;
	return String(senseId || `${entry.word || 'word'}:${entry.pos || 'unknown'}:${sequence}`);
}

/** Converts one Yiddish upstream record into the native canonical lexical schema. */
export function normalizeKaikkiEntry(entry = {}, sequence = 0) {
	if (entry.lang_code && entry.lang_code !== 'yi') return null;
	const headword = plainText(entry.word);
	const normalized = normalizeLexiconKey(headword);
	const senses = Array.isArray(entry.senses)
		? entry.senses.map(normalizeSense).filter(Boolean)
		: [];
	if (!headword || !normalized || !senses.length) return null;
	const forms = Array.isArray(entry.forms)
		? entry.forms.map(form => form?.form).filter(Boolean)
		: [];
	return {
		headword,
		normalized,
		sourceId: sourceIdentity(entry, sequence),
		partOfSpeech: plainText(entry.pos),
		senses,
		alternateHeadwords: uniqueText(forms.filter(form => form !== headword), 24),
		sourceLexicon: 'Yiddish Wiktionary Lexicon'
	};
}
