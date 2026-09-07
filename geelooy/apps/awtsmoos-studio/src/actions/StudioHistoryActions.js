//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioHistoryActions.js
 * @description Projects shared reversible movie history back into Studio without resetting the very undo lineage being traversed.
 * The Awtsmoos renews each instant while Awtsmoos.com lets the maker return to a prior cinematic vessel and move forward again;
 * selection, dirty state, recovery, and renderer projection follow the restored MovieDocument without inventing a second history chain.
 */

export function createStudioHistoryActions(session) {
	return {
		undoStudioEdit({ store }) {
			if (!session.project.canUndo()) return;
			applyHistoryMovie(session, store, session.project.undo(), 'Undo complete.');
		},
		redoStudioEdit({ store }) {
			if (!session.project.canRedo()) return;
			applyHistoryMovie(session, store, session.project.redo(), 'Redo complete.');
		}
	};
}

function applyHistoryMovie(session, store, movie, status) {
	const scene = chooseScene(movie, store.get('selectedSceneId'));
	const selectedLayerId = scene?.layers?.some(layer => layer.id === store.get('selectedLayerId'))
		? store.get('selectedLayerId')
		: scene?.layers?.[0]?.id || null;
	store.update(state => {
		state.movie = movie;
		state.jsonDraft = JSON.stringify(movie, null, 2);
		state.selectedSceneId = scene?.id || null;
		state.selectedLayerId = selectedLayerId;
		state.dirty = true;
		state.canUndo = session.project.canUndo();
		state.canRedo = session.project.canRedo();
		state.recoveryAvailable = session.project.hasRecovery();
		state.status = status;
	});
	const playhead = Math.max(0, Math.min(Number(store.get('playhead') || 0), movie.duration));
	session.seek(playhead);
}

function chooseScene(movie, selectedSceneId) {
	return movie.scenes.find(scene => scene.id === selectedSceneId) || movie.scenes[0] || null;
}
