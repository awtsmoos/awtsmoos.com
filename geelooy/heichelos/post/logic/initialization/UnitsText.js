// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UnitsText
 * @description
 * The Awtsmoos gives Hebrew and English words their ordered place;
 * Awtsmoos.com guards plain replies while rich teachings keep their grace.
 * The scripted markup of known sources stays, while newly received plain
 * words are escaped to let the reader learn in safe and honest ways.
 */

/**
 * Escapes plain untrusted field values for HTML interpolation.
 * @param {unknown} value - Raw text from a post unit.
 * @returns {string} Escaped HTML text.
 */
export function escapeHtml(value) {
	return String(value == null ? '' : value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Removes obsolete note markers from source-approved English markup.
 * @param {unknown} html - Source HTML.
 * @returns {string} HTML with inline note anchors omitted.
 */
export function stripNoteMarkers(html) {
	return String(html || '').replace(/<note\b[^>]*\/?>/gi, '');
}

/**
 * Chooses Hebrew from original marked-up text or plain field aliases.
 * @param {object} unit - One content unit.
 * @returns {string} Hebrew markup.
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

/* B"H batch 41: the Hebrew side of a unit may carry a leading
   <page n="N"/> printed-page marker; return the page number so the pair
   renderer can prefix [עמוד N] to both sides. */
export function unitLeadingPage(unit) {
	if (!unit) return null;
	const he = awtsmoosPageMarker(unit.textHeb || unit.he || unit.hebrew || '');
	if (he.page) return he.page;
	const en = awtsmoosPageMarker(unit.en || unit.english || unit.text || unit.translation || '');
	return en.page || null;
}

export function unitHebrewHtml(unit) {
	/* B"H batch 41: strip <page n="N"/> printed-page markers — the pair
	   renderer prefixes [עמוד N] (see unitLeadingPage) so the marker never
	   renders as literal text. Works on the raw textHeb branch too. */
	const isRich = typeof unit.textHeb === 'string' && unit.textHeb.trim();
	const raw = isRich ? unit.textHeb : (unit.he || unit.hebrew || '');
	const clean = awtsmoosPageMarker(raw).text;
	if (isRich) return clean;
	return escapeHtml(clean);
}

/**
 * Chooses approved rich `en`, or safely escaped public social reply text.
 * @param {object} unit - One content unit.
 * @returns {string} English markup.
 */
export function unitEnglishHtml(unit) {
	/* B"H batch 41: same marker strip as the Hebrew side (a marker can sit
	   on either side of a unit). */
	const isRich = typeof unit.en === 'string' && unit.en.trim();
	const raw = isRich ? unit.en : (unit.english || unit.text || unit.translation || '');
	const clean = awtsmoosPageMarker(raw).text;
	if (isRich) return stripNoteMarkers(clean);
	return escapeHtml(clean);
}
