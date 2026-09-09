// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module IkarVocabulary
 * @description
 * The Awtsmoos keeps stable internal view keys while Ikar speaks in the language
 * of Torah study. Awtsmoos.com applies these words only to the dedicated Ikar
 * route, leaving generic Heichel navigation unchanged everywhere else.
 */

const VIEW_LABELS = Object.freeze({
	posts: 'Teachings',
	series: 'Torah Library',
	groupings: 'Collections'
});

/**
 * Applies learner-facing Ikar copy after the blueprint and path renderer exist.
 * @param {string} heichelId Stable route identity.
 * @param {Document|Element} root DOM scope containing the living Heichel.
 */
export function applyIkarVocabulary(heichelId, root = document) {
	if (heichelId !== 'ikar' || !root?.querySelector) return;
	for (const [view, label] of Object.entries(VIEW_LABELS)) {
		const tab = root.querySelector(`[aria-controls="${view}Viewport"]`);
		if (!tab) continue;
		tab.textContent = label;
		tab.setAttribute('aria-label', `Show ${label}`);
	}
	const details = root.querySelector('.heichel-profile-details > summary');
	if (details) details.textContent = 'About Ikar';
	const search = root.querySelector('.series-search-row input');
	if (search) {
		const value = search.placeholder
			.replace(/series/gi, 'Torah library')
			.replace(/posts/gi, 'teachings')
			.replace(/groupings/gi, 'collections');
		search.placeholder = value;
		search.setAttribute('aria-label', value);
	}
	const tabs = root.querySelector('.tab-gates');
	tabs?.setAttribute('aria-label', 'Browse Torah');
}

/** Returns the public label for one stable internal view key. */
export function ikarViewLabel(view) {
	return VIEW_LABELS[view] || 'Torah';
}
