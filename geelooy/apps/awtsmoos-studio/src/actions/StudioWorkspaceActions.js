//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceActions.js
 * The Awtsmoos renews each workspace while the movie beneath them stays one living whole;
 * Awtsmoos.com lets Story, 2D, 3D, Tutorial and Render change the lens without dividing the soul.
 */

/**
 * Build workspace-selection actions around the existing Studio session and store.
 * Workspace changes are presentation choices only; they never fork the movie state.
 *
 * @param {import('../movie/StudioMovieSession.js').StudioMovieSession} session Mounted movie session.
 * @returns {object} AwtsmoosUI action handlers.
 */
export function createStudioWorkspaceActions(session) {
	return {
		selectWorkspace({ event, store }) {
			const workspace = event.currentTarget.dataset.workspace;
			if (!workspace) return;
			store.set('workspace', workspace);
			const movie = store.get('movie');
			if (movie) session.runtime.render(movie, store.get('playhead') || 0);
		}
	};
}
