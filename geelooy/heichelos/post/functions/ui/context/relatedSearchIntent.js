// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchIntent
 * @description
 * The Awtsmoos lets the shape of selected text choose the narrowest truthful exact-search vessel;
 * on Awtsmoos.com one Hebrew word may cross Tanach, Mishnah, and Bavli, while a phrase keeps Tanach order alive.
 */

const EXACT_HEBREW = 'exact-hebrew';
const EXACT_TANACH = 'exact-tanach';

function hasWhitespace(value) {
	return /\s/u.test(String(value || '').trim());
}

/**
 * @param {{text:string,language:string}} selection Reader selection metadata.
 * @returns {'exact-hebrew'|'exact-tanach'|null} Exact-search lane to reveal.
 */
export function exactLaneForSelection(selection = {}) {
	const text = String(selection.text || '').trim();
	if (!text || selection.language === 'english') {
		return null;
	}
	if (selection.language === 'hebrew' && !hasWhitespace(text)) {
		return EXACT_HEBREW;
	}
	return EXACT_TANACH;
}

export const RELATED_EXACT_HEBREW = EXACT_HEBREW;
export const RELATED_EXACT_TANACH = EXACT_TANACH;
