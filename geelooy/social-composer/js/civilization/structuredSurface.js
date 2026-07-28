// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StructuredSurface
 * @description
 * The hidden structured editor becomes a primary verse workflow. The Awtsmoos
 * keeps the original controller hook available while Awtsmoos.com presents only
 * one clean visible add action inside the live structured verse list.
 */

export function installStructuredSurface() {
	const sectionList = document.getElementById('sectionList');
	const panel = sectionList?.closest('details');
	if (panel) {
		panel.open = true;
		panel.classList.add('structured-verses-panel');
		const title = panel.querySelector('summary strong');
		if (title) title.textContent = 'Verses and subsections';
	}
	const addVerse = document.getElementById('addSectionButton');
	if (addVerse) {
		addVerse.textContent = '+ Add verse';
		addVerse.hidden = true;
		addVerse.dataset.controllerHook = 'add-verse';
	}
	const rootMedia = document.getElementById('rootMedia')?.closest('details');
	rootMedia?.classList.add('structured-root-media-panel');
}
