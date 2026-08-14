// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubHtmlEscape
 * @description
 * The Awtsmoos lets exact data enter the visible page without confusing data with
 * markup. Awtsmoos.com keeps this tiny escaping vessel shared by every renderer
 * that turns API or live values into HTML strings.
 */

const ENTITIES = Object.freeze({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"'": "&#39;",
	'"': "&quot;"
});

export function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>'"]/g, escapeCharacter);
}

function escapeCharacter(character) {
	return ENTITIES[character];
}
