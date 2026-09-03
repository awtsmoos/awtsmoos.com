//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceActions.js
 * @description Keeps native workspace changes and lazy professional-tool entrances behind one honest presentation-action family.
 * The Awtsmoos renews one movie while Awtsmoos.com changes only the editor's lens, never the canonical work beneath;
 * simple Create/Edit/Animate modes and deeper Audio/More doors therefore meet without splitting project truth into competing breath.
 */
import { getStudioWorkspaceMode } from '../workspace/StudioWorkspaceModes.js';

/** Builds backward-compatible workspace actions around the mounted Studio session. */
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
			const mode = getStudioWorkspaceMode(
				event.currentTarget.dataset.workspaceMode
			);
			store.update((state) => {
				state.workspaceMode = mode.id;
				state.activePanel = mode.panel;
				state.viewportMode = mode.viewport;
				state.timelineExpanded = mode.timelineExpanded;
				state.status = `${mode.label} workspace ready.`;
			});
		},
		openProTool({ event, store }) {
			const toolId = event.currentTarget.dataset.proTool;
			const proTools = globalThis.AwtsmoosStudioProTools;
			if (!toolId || !proTools?.open) {
				store.set('status', 'Professional tools are still waking up.');
				return;
			}
			proTools.open(toolId);
			store.set('status', `Opening ${toolId} professional tools…`);
		},
		openProTools({ store }) {
			const proTools = globalThis.AwtsmoosStudioProTools;
			if (!proTools?.open) {
				store.set('status', 'Professional tools are still waking up.');
				return;
			}
			proTools.open();
			store.set('status', 'Professional tools ready to choose.');
		}
	};
}
