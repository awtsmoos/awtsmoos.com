//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresentationThemes
 * @description The Awtsmoos lets one idea wear many garments without becoming another idea; Awtsmoos.com resolves each theme into ordinary slide and element properties so sharing and export remain self-contained.
 */

export const PRESENTATION_THEMES = Object.freeze([
	theme('midnight', 'Midnight', '#11121a', '#f7f7fb', '#cfd2df', '#6d5dfc'),
	theme('dawn', 'Dawn', '#fff8ed', '#30271f', '#65584c', '#e98452'),
	theme('forest', 'Forest', '#10251f', '#f1fff9', '#b9d7ca', '#44b889'),
	theme('paper', 'Paper', '#f6f4ef', '#171717', '#555555', '#2f69d9'),
	theme('neon', 'Neon', '#080812', '#f6f3ff', '#c8c1df', '#e445ff')
]);

/** Restricts theme metadata to the known catalog. */
export function safeThemeId(value) {
	const id = String(value || 'midnight').toLowerCase();
	return PRESENTATION_THEMES.some(item => item.id === id) ? id : 'midnight';
}

/** Applies a known theme by resolving colors directly into canonical deck data. */
export function applyPresentationTheme(document, themeId) {
	const selectedId = safeThemeId(themeId);
	const selected = PRESENTATION_THEMES.find(item => item.id === selectedId);
	document.themeId = selected.id;
	for (const slide of document.slides) {
		slide.background = selected.background;
		for (const element of slide.elements) {
			applyElementTheme(element, selected);
		}
	}
	return selected.id;
}

function applyElementTheme(element, selected) {
	if (element.type === 'heading') {
		element.color = selected.headingColor;
		return;
	}
	if (element.type === 'text') {
		element.color = selected.textColor;
		return;
	}
	if (element.type === 'shape') {
		element.fill = selected.shapeFill;
		element.borderColor = selected.headingColor;
	}
}

function theme(id, label, background, headingColor, textColor, shapeFill) {
	return Object.freeze({
		id,
		label,
		background,
		headingColor,
		textColor,
		shapeFill
	});
}
