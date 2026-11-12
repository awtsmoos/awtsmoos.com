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
/**
 * B"H batch 30 + batch 41 — printed-page markers. The imported corpora prefix
 * the first phrase of each printed page with a literal <pg n="N"/> tag (batch
 * 30); the Sefer HaSichos units carry the same marker as <page n="N"/>
 * (batch 41). Rendered raw either leaks onto the page as visible text; the
 * reader law keeps page turns inline as [עמוד N] instead. Leading markers
 * become the bracket form; a marker anywhere else is dropped (its page turn
 * is the next phrase's leading marker). A bare </page> closer and the mangled
 * literal </"page n="N> are stripped the same way.
 */
const PAGE_MARKER_NUM_RE = /<\/?"?\s*(?:pg|page)\s+n\s*=\s*"?(\d+)"?\s*\/?>/gi;
const PAGE_MARKER_BARE_RE = /<\/?(?:pg|page)\s*\/?>/gi;
const PAGE_MARKER_LEAD_RE = /^\s*<\/?"?\s*(?:pg|page)\s+n\s*=\s*"?(\d+)"?\s*\/?>/i;
function awtsmoosPageMarker(text) {
	const s = text == null ? '' : String(text);
	const lead = s.match(PAGE_MARKER_LEAD_RE);
	const strip = (v) => v.replace(PAGE_MARKER_NUM_RE, '').replace(PAGE_MARKER_BARE_RE, '');
	if (lead) return { page: lead[1], text: strip(s.replace(PAGE_MARKER_LEAD_RE, '')).trim() };
	return { page: null, text: strip(s) };
}

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
	/* B"H batch 41: the unit's own Hebrew may carry the leading page marker
	   even when the first phrase does not (the phrases concatenate back to
	   the unit Hebrew); the first rendered phrase inherits it. */
	const unitPage = awtsmoosPageMarker(unit.he || unit.hebrew || '').page
		|| awtsmoosPageMarker(unit.english || unit.en || '').page;
	let firstPhrase = true;
	for (const phrase of unit.phrases) {
		if (!phrase || typeof phrase !== 'object') continue;
		/* B"H batch 41: a phrase may carry a printed-page marker
		   (<page n="N"/> / <pg n="N"/>) — leading marker becomes
		   [עמוד N] on BOTH spans; any other marker is dropped. */
		const heRaw = typeof phrase.he === 'string' ? phrase.he : '';
		const enRaw = typeof phrase.en === 'string' ? phrase.en : '';
		const heM = awtsmoosPageMarker(heRaw);
		const enM = awtsmoosPageMarker(enRaw);
		const page = heM.page || enM.page || (firstPhrase ? unitPage : null);
		const he = (page ? '[עמוד ' + page + '] ' : '') + heM.text;
		const en = (page ? '[עמוד ' + page + '] ' : '') + enM.text;
		if (!he.trim() && !en.trim()) continue;
		firstPhrase = false;
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
