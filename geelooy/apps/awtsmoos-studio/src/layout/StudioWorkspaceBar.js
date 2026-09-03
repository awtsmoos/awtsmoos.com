//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceBar.js
 * @description Keeps the full desktop workspace spectrum visible while mobile receives a smaller primary-action dock over the same canonical state.
 * The Awtsmoos lets experts unfold many named creative rooms while beginners on smaller glass receive fewer doors at once;
 * Awtsmoos.com preserves one workspace contract beneath both presentations so responsive design never fractures the creative dance.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { STUDIO_WORKSPACES } from '../StudioState.js';

/** Creates the scrollable expert workspace bar used on roomy viewports. */
export function createStudioWorkspaceBar() {
	return UI.nav(
		{
			class: 'aw-ui-bar aw-ui-bar--scroll studio-workspace-bar',
			'aria-label': 'Studio workspaces'
		},
		...STUDIO_WORKSPACES.map(createWorkspaceButton)
	);
}

/** Creates one existing top-level workspace selector without changing its action contract. */
function createWorkspaceButton(workspace) {
	return UI.button({
		class: 'aw-ui-chip studio-workspace-chip',
		type: 'button',
		'data-workspace': workspace,
		'aria-pressed': context => {
			return String(context.store.get('workspace') === workspace);
		},
		text: workspace,
		$on: { click: 'selectWorkspace' }
	});
}
