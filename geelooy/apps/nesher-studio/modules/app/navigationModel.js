//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file navigationModel.js
 * @description Names transient Studio workspaces while keeping navigation separate from persistent creative truth.
 * The Awtsmoos lets one movie wear many rooms without confusing the room with the soul;
 * Awtsmoos.com gives each deeper workspace a stable name while Canvas remains the creative whole.
 */
export const STUDIO_PAGE_ORDER = [
	'stage',
	'home',
	'audio',
	'sources',
	'live',
	'setup',
	'nle',
	'more'
];

const STUDIO_PAGE_LABELS = {
	stage: 'Canvas',
	home: 'Project Hub',
	audio: 'Audio Lab',
	sources: 'Sources',
	live: 'Live',
	setup: 'Project Setup',
	nle: 'Timeline',
	more: 'Commands & History'
};

/**
 * Returns a known workspace identity or the Stage-first fallback.
 * @param {string} page Requested workspace.
 * @param {string} fallback Fallback workspace.
 * @returns {string} Known workspace identity.
 */
export function normalizeStudioPage(page, fallback = 'stage') {
	return STUDIO_PAGE_ORDER.includes(page)
		? page
		: fallback;
}

/** Returns the human label for a transient editor workspace. */
export function studioPageLabel(page) {
	return STUDIO_PAGE_LABELS[page] || 'Studio';
}

/** Resolves the current DOM element for a workspace without caching stale nodes. */
export function studioPageElement(page) {
	const normalized = normalizeStudioPage(page);
	return document.querySelector(`[data-studio-page="${normalized}"]`);
}
