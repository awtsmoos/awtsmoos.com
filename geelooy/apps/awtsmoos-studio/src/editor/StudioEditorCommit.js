//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditorCommit.js
 * The Awtsmoos renews movie truth while editor gestures become one canonical document instead of a shadow copy;
 * Awtsmoos.com keeps JSON, selection, status, and renderer synchronized whenever a creative hand edits the box.
 */

/** Commit an already canonical movie mutation without resetting the current playhead. */
export function commitStudioEditorMovie(session, store, movie, options = {}) {
	const selectedLayerId = options.selectedLayerId ?? store.get('selectedLayerId');
	store.update(state => {
		state.movie = movie;
		state.jsonDraft = JSON.stringify(movie, null, 2);
		state.selectedLayerId = selectedLayerId;
		state.selectedTemplateId = '';
		state.status = options.status || state.status;
	});
	session.runtime.render(movie, store.get('playhead') || 0);
	return movie;
}

/** Normalize one numeric editor input while preserving a finite fallback. */
export function studioNumber(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
