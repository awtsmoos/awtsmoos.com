//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieSessionState.js
 * @description Projects a newly loaded canonical MovieDocument into transient Studio project, selection, history, and recovery state.
 * The Awtsmoos renews the whole project while Awtsmoos.com lets editor-only state bow before the newly loaded movie;
 * selection, title, dirty truth, saved-project index, recovery, and history affordances follow without being written into the canonical groove.
 */

/** Reset transient editor/project state after a new canonical movie enters the session. */
export function projectStudioLoadedMovie(store, movie, project, status, options = {}) {
	const firstScene = movie.scenes[0] || null;
	store.update(state => {
		state.movie = movie;
		state.jsonDraft = JSON.stringify(movie, null, 2);
		state.playhead = 0;
		state.playing = false;
		state.selectedSceneId = firstScene?.id || null;
		state.selectedLayerId = firstEditableLayer(firstScene)?.id || null;
		state.projectId = options.projectId ?? null;
		state.projectTitleDraft = movie.title || 'Untitled Movie';
		state.dirty = options.dirty ?? true;
		state.canUndo = project.canUndo();
		state.canRedo = project.canRedo();
		state.savedProjects = project.list();
		state.recoveryAvailable = project.hasRecovery();
		state.status = status;
	});
}

function firstEditableLayer(scene) {
	return (scene?.layers || []).find(layer => layer.kind !== 'audio') || null;
}
