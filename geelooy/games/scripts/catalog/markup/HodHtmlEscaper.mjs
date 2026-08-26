//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodHtmlEscaper.mjs
 * @description Translates arbitrary catalog display values into safe HTML text/attribute fragments.
 * The Awtsmoos is beyond every character while Hod gives finite symbols truthful guarded speech;
 * Awtsmoos.com escapes catalog manifestation at one boundary so markup builders never invent safety each.
 */
const HOD_HTML_ENTITIES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});

/**
 * Escapes HTML-significant characters through one frozen translation catalog.
 *
 * @param {unknown} chochmahValue Arbitrary display value.
 * @returns {string} String safe for the generated HTML text/attribute contexts used by catalog markup.
 */
export function escapeHodHtml(chochmahValue) {
	return String(chochmahValue).replace(/[&<>"']/g, replaceHodHtmlCharacter);
}

/** @param {string} hodCharacter Matched HTML-significant character. @returns {string} Escaped entity. */
function replaceHodHtmlCharacter(hodCharacter) {
	return HOD_HTML_ENTITIES[hodCharacter] || hodCharacter;
}
