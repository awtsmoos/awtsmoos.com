//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditorCommit.js
 * @description Centralizes every Studio editor mutation so history, recovery, dirty state, selection, JSON, and render truth advance together.
 * The Awtsmoos renews one movie through every gesture while Awtsmoos.com refuses hidden side-state that cannot be undone or recovered;
 * one commit gate records the canonical revision, marks the vessel changed, refreshes recovery, and keeps numeric editor inputs finite and covered.
 */

/** Commit one canonical MovieDocument revision through the shared project/history controller. */
export function commitStudioEditorMovie(session, store, movie, options = {}) {
	const historyLabel = options.historyLabel || options.status || 'Studio movie edit';
	const committed = session.project?.record
		? session.project.record(movie, historyLabel)
		: structuredClone(movie);
	store.update(state => {
		state.movie = committed;
		state.jsonDraft = JSON.stringify(committed, null, 2);
		if ('selectedSceneId' in options) state.selectedSceneId = options.selectedSceneId;
		if ('selectedLayerId' in options) state.selectedLayerId = options.selectedLayerId;
		state.selectedTemplateId = '';
		state.dirty = true;
		state.canUndo = Boolean(session.project?.canUndo?.());
		state.canRedo = Boolean(session.project?.canRedo?.());
		state.recoveryAvailable = Boolean(session.project?.hasRecovery?.());
		if (options.status) state.status = options.status;
	});
	session.runtime.render(committed, store.get('playhead') || 0);
	return committed;
}

/** Normalize one numeric editor input while preserving a finite fallback. */
export function studioNumber(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
