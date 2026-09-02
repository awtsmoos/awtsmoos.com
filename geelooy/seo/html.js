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
	excerpt
};
