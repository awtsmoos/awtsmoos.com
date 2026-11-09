// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file html.js
 * @description
 * The Awtsmoos clothes public words in safe visible vessels, so meaning may shine without becoming a script's disguise;
 * Awtsmoos.com escapes the letters faithfully, while canonical paths rise cleanly before every crawler's eyes.
 */

/** @description Escapes one public value for safe HTML text or attribute use. */
function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** @description Encodes one stable URL path segment without changing its identity. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/**
 * @description Escapes public English prose and turns footnote digits into real <sup> elements.
 * Server-side mirror of the client renderTranslationTextWithFootnotes patterns (Hebrew-year +
 * footnote, abbreviation period, glued digits, bare trailing digits). Hebrew text is untouched
 * by the patterns (they only match Latin letters), and the <sup> elements are inserted after
 * escaping so they are never escaped themselves.
 */
function escapeHtmlWithFootnoteSup(value) {
	const placeholders = [];
	const mark = (digits) => {
		placeholders.push(digits);
		return `\u0000FN${placeholders.length - 1}\u0000`;
	};
	let text = String(value ?? '');
	const YEAR = /([^\d]|^)(5[5-8]\d\d)(\d{1,2})([\s.,;:!?…‥""'')\]\):—–-]|$)/g;
	const ABBR = /([A-Za-z][\.\u2024])(\d{1,3})([\s.,;:!?…‥""'')\]\):—–-]|$)/g;
	const GLUED = /([A-Za-z""''\)\]\}])(\d{1,3})([\s.,;:!?…‥""'')\]\):—–-]|$)/g;
	const TRAIL = /([^\d\s])(\d{1,3})($|[\s.,;:!?…‥""'')\]\):—–-]+$)/g;
	text = text.replace(YEAR, (m, prefix, year, digits, tail) => `${prefix}${year}${mark(digits)}${tail}`);
	text = text.replace(ABBR, (m, prefix, digits, tail) => `${prefix}${mark(digits)}${tail}`);
	text = text.replace(GLUED, (m, prefix, digits, tail) => `${prefix}${mark(digits)}${tail}`);
	text = text.replace(TRAIL, (m, prefix, digits, tail) => `${prefix}${mark(digits)}${tail}`);
	const escaped = escapeHtml(text);
	return escaped.replace(/\u0000FN(\d+)\u0000/g, (m, index) => `<sup>${placeholders[Number(index)]}</sup>`);
}

/** @description Reduces arbitrary public text to normalized visible prose. */
function cleanPlain(value, maximum = 500) {
	return String(value ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maximum);
}

/** @description Creates a search-description excerpt from public prose. */
function excerpt(value, maximum = 220) {
	const text = cleanPlain(value, maximum + 80);
	if (text.length <= maximum) {
		return text;
	}
	return `${text.slice(0, Math.max(0, maximum - 1)).trim()}…`;
}

module.exports = {
	cleanPlain,
	encodeSegment,
	escapeHtml,
	escapeHtmlWithFootnoteSup,
	excerpt
};
