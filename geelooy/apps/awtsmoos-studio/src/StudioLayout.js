//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayout.js
 * @description Composes a canvas-first unified Studio whose desktop depth and mobile primary actions share the same canonical project and action contracts.
 * The Awtsmoos lets one creative dwelling reveal status, workspaces, templates, canvas, time, and deeper doors without crowding the maker's sight;
 * Awtsmoos.com therefore places project truth near the top and a small touch-first creative dock near the hand while the canvas remains bright.
 */
import { UI } from '../../../libs/AwtsmoosUI/src/index.js';
import { createStudioHeader } from './layout/StudioHeader.js';
import { createStudioPanels } from './layout/StudioPanels.js';
import { createStudioPrimaryDock } from './layout/StudioPrimaryDock.js';
import { createStudioProjectStatusBar } from './layout/StudioProjectStatusBar.js';
import { createStudioTemplateShelf } from './layout/StudioTemplateShelf.js';
import { createStudioTransport } from './layout/StudioTransport.js';
import { createStudioWorkspaceBar } from './layout/StudioWorkspaceBar.js';

/** Returns the declarative unified Studio shell consumed by the shared AwtsmoosUI renderer. */
export function createStudioLayout() {
	return UI.div(
		{
			class: 'aw-ui-shell studio-shell'
		},
		createStudioHeader(),
		createStudioProjectStatusBar(),
		createStudioWorkspaceBar(),
		createStudioTemplateShelf(),
		createStudioPanels(),
		createStudioTransport(),
		createStudioPrimaryDock()
	);
}
