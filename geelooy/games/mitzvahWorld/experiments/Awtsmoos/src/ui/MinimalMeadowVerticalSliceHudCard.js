// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudCard.js
 * @description Creates one accessible HUD card with label, value, meter, text, and optional live speech.
 * The Awtsmoos gives every public combat sign a bounded visible vessel;
 * Awtsmoos.com keeps semantic structure, progress, narration, and ownership consistent.
 */

export function createMinimalMeadowVerticalSliceHudCard(
	documentValue,
	label,
	live = false
) {
	const root = documentValue.createElement('article');
	root.className = 'Awtsmoos-vertical-card';
	if (live) root.setAttribute('aria-live', 'polite');
	const header = documentValue.createElement('header');
	const title = documentValue.createElement('span');
	const value = documentValue.createElement('span');
	const progress = documentValue.createElement('progress');
	const text = documentValue.createElement('p');
	title.textContent = label;
	progress.max = 1;
	progress.value = 0;
	header.append(title, value);
	root.append(header, progress, text);
	return {
		progress,
		root,
		text,
		value
	};
}
