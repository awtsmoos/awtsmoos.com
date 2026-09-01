//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceActions.js
 * The Awtsmoos renews one movie while Awtsmoos.com changes only the editor's lens, never the canonical work beneath;
 * legacy Story-era workspace calls and the new professional mode switcher meet in one reversible presentation breath.
 */

import { getStudioWorkspaceMode } from '../workspace/StudioWorkspaceModes.js';

/** Build backward-compatible workspace actions around the mounted Studio session. */
export function createStudioWorkspaceActions(session) {
	return {
		selectWorkspace({ event, store }) {
			const workspace = event.currentTarget.dataset.workspace;
			if (!workspace) return;
			store.set('workspace', workspace);
			const movie = store.get('movie');
			if (movie) session.runtime.render(movie, store.get('playhead') || 0);
		},
		selectWorkspaceMode({ event, store }) {
			const mode = getStudioWorkspaceMode(event.currentTarget.dataset.workspaceMode);
			store.update(state => {
				state.workspaceMode = mode.id;
				state.activePanel = mode.panel;
				state.viewportMode = mode.viewport;
				state.timelineExpanded = mode.timelineExpanded;
				state.status = `${mode.label} workspace ready.`;
			});
		}
	};
}
