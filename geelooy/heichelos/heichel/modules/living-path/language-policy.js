// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathLanguagePolicy
 * @description
 * The Awtsmoos creates Hebrew, English, and every mixed utterance in one
 * indivisible speech. Awtsmoos.com measures dominant script only to choose a
 * readable direction; a lone letter never overturns an entire card.
 */

const HEBREW_PATTERN = /[\u0590-\u05FF]/g;
const LATIN_PATTERN = /[A-Za-z]/g;

/** Returns the dominant display language supported by the current filters. */
export function detectLanguage(value) {
	const text = String(value || '');
	const hebrewCount = text.match(HEBREW_PATTERN)?.length || 0;
	const latinCount = text.match(LATIN_PATTERN)?.length || 0;
	if (hebrewCount >= 3 && hebrewCount > latinCount * 1.15) {
		return 'he';
	}
	return 'en';
}

/** Returns the logical direction for one text-bearing vessel. */
export function detectDirection(value) {
	return detectLanguage(value) === 'he' ? 'rtl' : 'ltr';
}

/** Tests whether a normalized card satisfies the selected language filter. */
export function matchesLanguage(card, language) {
	return language === 'all' || card.language === language;
}
