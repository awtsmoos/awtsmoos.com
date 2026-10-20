//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module UnitsPhrases
 * @description
 * The Awtsmoos speaks Toras Chaim through a second units vessel: each
 * unit carries its whole Hebrew paragraph in `he`, and its ordered
 * bilingual segmentation in `phrases` — {he, en} pairs whose Hebrew
 * concatenates back to the unit's Hebrew (verified against the live
 * payload, modulo whitespace). The unit-level renderer sees no `en`
 * on this shape and would print Hebrew alone, hiding English the
 * payload already carries. This module renders such a unit as a
 * phrase-by-phrase interleave — Hebrew phrase, then its English —
 * which is the reader's standing bilingual law.
 */

/**
 * Escapes HTML special characters in plain-text values. Phrase text in
 * this corpus is plain text (no markup), so escaping is the honest
 * rendering; it mirrors the escaper used by UnitsManifest.
 * @param {unknown} value Raw value.
 * @returns {string} Escaped string.
 */
function escapeHtml(value) {
	return String(value == null ? '' : value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * True when a unit carries a usable phrase segmentation with English.
 * @param {object} unit Units-shaped post unit.
 * @returns {boolean} True when at least one phrase carries English.
 */
export function unitHasPhrases(unit) {
	if (!unit || !Array.isArray(unit.phrases) || !unit.phrases.length) {
		return false;
	}
	return unit.phrases.some(
		(phrase) => phrase
			&& typeof phrase.en === 'string'
			&& phrase.en.trim()
	);
}

/**
 * Builds the interleaved phrase HTML for one phrases-shaped unit:
 * every phrase as a Hebrew span followed by its English span, in order.
 * @param {object} unit Units-shaped post unit with a `phrases` array.
 * @returns {string} HTML string (empty when no usable phrases exist).
 */
export function buildUnitPhrasesHtml(unit) {
	if (!unitHasPhrases(unit)) return '';
	const parts = [];
	for (const phrase of unit.phrases) {
		if (!phrase || typeof phrase !== 'object') continue;
		const he = typeof phrase.he === 'string' ? phrase.he : '';
		const en = typeof phrase.en === 'string' ? phrase.en : '';
		if (!he.trim() && !en.trim()) continue;
		parts.push(
			'<span class="bavli-phrase">'
			+ (he.trim()
				? '<span class="bavli-phrase-he" dir="rtl" lang="he">'
					+ escapeHtml(he) + '</span> '
				: '')
			+ (en.trim()
				? '<span class="bavli-phrase-en" dir="ltr" lang="en">'
					+ escapeHtml(en) + '</span>'
				: '')
			+ '</span> '
		);
	}
	if (!parts.length) return '';
	return '<div class="bavli-unit-phrases" style="line-height:1.9;">'
		+ parts.join('')
		+ '</div>';
}
