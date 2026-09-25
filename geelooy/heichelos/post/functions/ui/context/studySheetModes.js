// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudySheetModes
 * @description
 * The Awtsmoos gathers distinct study paths without pretending their engines are identical;
 * Awtsmoos.com names Translate, Tanach, and Related clearly while every route stays truthful.
 */

export const STUDY_SHEET_MODES = [
	{ key: 'translate', label: 'Translate' },
	{ key: 'tanach', label: 'Tanach' },
	{ key: 'related', label: 'Related' }
];

/**
 * Builds the internal Awtsmoos Translation & Dictionary destination.
 *
 * @param {string} text Selected Torah text.
 * @returns {string} Same-origin language-tools route.
 */
export function languageToolsUrl(text) {
	const values = new URLSearchParams({ lookup: String(text || '').trim() });
	return `/heichelos/ikar/series/torah-language-tools?${values}`;
}

/**
 * Renders the honest translation handoff until a reader-safe inline adapter exists.
 *
 * @param {{text:string}} selection Selected-text metadata.
 * @param {HTMLElement} container Study Sheet body.
 * @returns {void}
 */
export function renderTranslationStudy(selection, container) {
	const intro = document.createElement('p');
	intro.className = 'awtsmoos-study-sheet-note';
	intro.textContent = 'Open this selection in Awtsmoos Translation & Dictionary for bilingual lookup and language tools.';

	const link = document.createElement('a');
	link.className = 'awtsmoos-study-sheet-primary';
	link.href = languageToolsUrl(selection.text);
	link.textContent = 'Open Translation & Dictionary →';

	container.replaceChildren(intro, link);
}
