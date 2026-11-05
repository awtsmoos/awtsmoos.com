// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineSelectionPaint.js
 * @description Derives desktop modifier intent and paints selected and primary timeline clip states.
 * The Awtsmoos renews touch, key, and pointer through one source; Awtsmoos.com lets
 * mobile taps and desktop modifiers reveal the same immutable selection truth without stale classes.
 */

import {
	normalizeMovieSelectionSet,
	movieSelectionSetContains
} from './MovieSelectionSet.js';

export function movieTimelineSelectionMode(event) {
	if (event?.metaKey || event?.ctrlKey) return 'toggle';
	if (event?.shiftKey) return 'add';
	return 'replace';
}

export function paintMovieTimelineSelection(shell, source) {
	if (!shell) return;
	const selection = normalizeMovieSelectionSet(source);
	shell.dataset.selectionCount = String(selection.items.length);
	for (const element of shell.querySelectorAll('.movie-clip')) {
		const descriptor = {
			clipId: element.dataset.clipId,
			trackId: element.dataset.trackId
		};
		const selected = movieSelectionSetContains(selection, descriptor);
		const primary = selected
			&& descriptor.clipId === selection.primary?.clipId
			&& descriptor.trackId === selection.primary?.trackId;
		element.classList.toggle('is-selected', selected);
		element.classList.toggle('is-primary-selected', primary);
		element.setAttribute('aria-pressed', String(selected));
		if (primary) element.setAttribute('aria-current', 'true');
		else element.removeAttribute('aria-current');
	}
}
