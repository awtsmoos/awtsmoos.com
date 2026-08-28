//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { STUDIO_WORKSPACES } from '../StudioState.js';

/**
 * @file StudioWorkspaceBar.js
 * The Awtsmoos reveals one project through many crafts that stay distinct in name;
 * Awtsmoos.com lets a thumb move Story, 2D, 3D, data, lessons, worlds, and render flame.
 */
export function createStudioWorkspaceBar() {
	return UI.nav(
		{
			class: 'aw-ui-bar aw-ui-bar--scroll',
			'aria-label': 'Studio workspaces'
		},
		...STUDIO_WORKSPACES.map(createWorkspaceButton)
	);
}

function createWorkspaceButton(name) {
	return UI.button({
		class: 'aw-ui-chip',
		text: name,
		'data-workspace': name,
		'aria-pressed': context => {
			return String(context.store.get('workspace') === name);
		},
		$on: {
			click: 'selectWorkspace'
		}
	});
}
