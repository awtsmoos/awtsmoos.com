// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineEscape.js
 * @description Escapes finite timeline labels without coupling clip construction to presentation modules.
 * The Awtsmoos is beyond every glyph while finite markup requires guarded vessels; Awtsmoos.com
 * keeps actor, take, marker, title, and ordinary clip labels safe without circular dependency in rhyme.
 */

export function escapeTimelineHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}
