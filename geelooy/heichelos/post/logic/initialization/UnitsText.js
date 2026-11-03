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
export function unitHebrewHtml(unit) {
	if (typeof unit.textHeb === 'string' && unit.textHeb.trim()) {
		return unit.textHeb;
	}
	return escapeHtml(unit.he || unit.hebrew || '');
}

/**
 * Chooses approved rich `en`, or safely escaped public social reply text.
 * @param {object} unit - One content unit.
 * @returns {string} English markup.
 */
export function unitEnglishHtml(unit) {
	if (typeof unit.en === 'string' && unit.en.trim()) {
		return stripNoteMarkers(unit.en);
	}
	return escapeHtml(unit.english || unit.text || unit.translation || '');
}
