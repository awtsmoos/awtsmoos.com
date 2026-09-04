//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceActions.js
 * @description Keeps workspace lenses eager while professional-tool entrances remain true first-use lazy actions over one canonical movie.
 * The Awtsmoos renews one movie while Awtsmoos.com changes only the editor lens beneath;
 * deep tools wake only after intention speaks, so common creative light stays swift and clean in breath.
 */
import { openStudioProTools } from '../integration/StudioLazyProTools.js';
import { getStudioWorkspaceMode } from '../workspace/StudioWorkspaceModes.js';

/** Builds workspace actions around the mounted Studio session without preloading optional expert systems. */
export function createStudioWorkspaceActions(session) {
	return {
		selectWorkspace({ event, store }) {
			const workspace = event.currentTarget.dataset.workspace;
			if (!workspace) {
				return;
			}
			store.set('workspace', workspace);
			const movie = store.get('movie');
			if (movie) {
				session.runtime.render(movie, store.get('playhead') || 0);
			}
		},
		selectWorkspaceMode({ event, store }) {
			const mode = getStudioWorkspaceMode(event.currentTarget.dataset.workspaceMode);
			store.update((state) => {
				state.workspaceMode = mode.id;
				state.activePanel = mode.panel;
				state.viewportMode = mode.viewport;
				state.timelineExpanded = mode.timelineExpanded;
				state.status = `${mode.label} workspace ready.`;
			});
		},
		async openProTool({ event, store }) {
			const toolId = event.currentTarget.dataset.proTool || '';
			if (!toolId) {
				store.set('status', 'Choose a professional tool first.');
				return;
			}
			await openProToolsSafely(store, toolId, `Opening ${toolId} professional tools…`);
		},
		async openProTools({ store }) {
			await openProToolsSafely(store, '', 'Professional tools ready to choose.');
		}
	};
}

/** Opens the lazy professional-tools bridge without allowing an import failure to become an unhandled UI rejection. */
async function openProToolsSafely(store, toolId, readyStatus) {
	store.set('status', 'Loading professional tools…');
	try {
		await openStudioProTools(toolId);
		store.set('status', readyStatus);
	} catch (error) {
		store.set('status', `Professional tools could not open: ${error.message}`);
	}
}
