// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InitialContentUnits
 * @description
 * The Awtsmoos gives every unit its voice, from Hebrew heart to English light;
 * Awtsmoos.com sets each teaching in the page before the scripts ignite.
 * No storage keys become Torah, no untrusted tags command the sight.
 */

const { escapeHtml, toPlainText } = require('./InitialContentText.js');

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

/**
 * Makes one plain, escaped paragraph with explicit language direction.
 * @param {unknown} value - Public source text, never trusted markup.
 * @param {'he'|'en'} language - Direction of the source text.
 * @returns {string} Safe HTML or an empty string.
 */
function renderUnitText(value, language) {
	const text = toPlainText(value == null ? '' : value);
	if (!text) {
		return '';
	}

	const direction = language === 'he' ? 'rtl' : 'ltr';
	const safeText = escapeHtml(text).replace(/\n/g, '<br>');
	return `<p class="awtsmoos-initial-unit" lang="${language}" dir="${direction}">${safeText}</p>`;
}

/**
 * Renders the `units` schema used by publicly indexed Torah and debate posts.
 * @param {unknown} units - Source units; may include unrelated metadata.
 * @returns {string} Readable text without labels, IDs, or metadata leakage.
 */
function renderReadableUnits(units) {
	if (!Array.isArray(units)) {
		return '';
	}

	return units.map((unit) => {
		if (typeof unit === 'string') {
			const mark = awtsmoosPageMarker(unit);
			const text = (mark.page ? '[עמוד ' + mark.page + '] ' : '') + mark.text;
			return renderUnitText(text, 'en');
		}
		if (!unit || typeof unit !== 'object') {
			return '';
		}

		/* B"H batch 41: a leading <page n="N"/> on either side becomes
		   [עמוד N] on BOTH paragraphs (the pair's page turn); the marker
		   itself is stripped before toPlainText flattens the text. */
		const hebrewMark = awtsmoosPageMarker(unit.he || unit.hebrew || '');
		const englishMark = awtsmoosPageMarker(unit.en || unit.english || unit.text || unit.translation || '');
		const page = hebrewMark.page || englishMark.page;
		const hebrewText = (page ? '[עמוד ' + page + '] ' : '') + hebrewMark.text;
		const englishText = (page ? '[עמוד ' + page + '] ' : '') + englishMark.text;
		return renderUnitText(hebrewText, 'he') + renderUnitText(englishText, 'en');
	}).filter(Boolean).join('\n');
}

module.exports = { renderReadableUnits, renderUnitText };
