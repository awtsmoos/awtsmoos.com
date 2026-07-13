// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorSerialization
 * @description
 * Awtsmoos.com gathers visible fields into the established API shape; the
 * Awtsmoos keeps every verse distinct while no invented media enters the body.
 */

/**
 * Serializes a structured post form for the existing draft endpoint.
 * @param {HTMLFormElement} form Editor form.
 * @param {import('./state.js').PostEditorState} state Structure state.
 * @param {object} config Explicit route context.
 * @returns {Record<string,string>} URL-encodable draft body.
 */
export function serializePost(form, state, config) {
	const data = new FormData(form);
	const verses = state.verses.map((verse, verseIndex) => ({
		id: `verse_${verseIndex + 1}`,
		label: value(data, `verse_${verseIndex}_label`) || `Verse ${verseIndex + 1}`,
		text: value(data, `verse_${verseIndex}_text`),
		assets: [],
		subsections: verse.subsections.map((unused, subsectionIndex) => ({
			id: `sub_${verseIndex + 1}_${subsectionIndex + 1}`,
			title: value(data, `verse_${verseIndex}_sub_${subsectionIndex}_title`) || `Subsection ${subsectionIndex + 1}`,
			text: value(data, `verse_${verseIndex}_sub_${subsectionIndex}_text`),
			assets: []
		}))
	}));
	return {
		aliasId: config.aliasId,
		author: config.aliasId,
		heichelId: config.heichelId,
		seriesId: config.seriesId,
		title: value(data, 'title'),
		description: value(data, 'description'),
		verses: JSON.stringify(verses),
		rootAssets: '[]'
	};
}

function value(data, name) {
	return String(data.get(name) || '').trim();
}
