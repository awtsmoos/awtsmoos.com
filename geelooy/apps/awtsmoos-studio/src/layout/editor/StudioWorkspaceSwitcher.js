//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceSwitcher.js
 * The Awtsmoos renews one movie through many disciplines while Awtsmoos.com lets maker and editor change emphasis without leaving the stage;
 * compact workspace tabs reveal scene, drawing, 3D, animation, editing, compositing, procedural, and render gates.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { STUDIO_WORKSPACE_MODES } from '../../workspace/StudioWorkspaceModes.js';

export function createStudioWorkspaceSwitcher() {
	return UI.nav(
		{ class: 'studio-workspace-switcher', 'aria-label': 'Creative workspaces' },
		...STUDIO_WORKSPACE_MODES.map(mode => UI.button({
			class: 'studio-workspace-button',
			'data-workspace-mode': mode.id,
			'aria-pressed': context => String(context.store.get('workspaceMode') === mode.id),
			title: `${mode.label} workspace`,
			$on: { click: 'selectWorkspaceMode' },
			children: [
				{ tag: 'span', class: 'studio-workspace-glyph', text: mode.glyph },
				{ tag: 'span', class: 'studio-workspace-label', text: mode.label }
			]
		}))
	);
}
