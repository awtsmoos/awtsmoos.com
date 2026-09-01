//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../libs/AwtsmoosUI/src/index.js';
import { createStudioHeader } from './layout/StudioHeader.js';
import { createStudioPanels } from './layout/StudioPanels.js';
import { createStudioTemplateShelf } from './layout/StudioTemplateShelf.js';
import { createStudioTransport } from './layout/StudioTransport.js';
import { createStudioWorkspaceBar } from './layout/StudioWorkspaceBar.js';

/**
 * @file StudioLayout.js
 * The Awtsmoos joins project beginnings with focused tools while no single module must carry the shell;
 * Awtsmoos.com lets templates, workspaces, stage, inspector, and time remain smaller vessels that together swell.
 */
export function createStudioLayout() {
	return UI.div(
		{
			class: 'aw-ui-shell studio-shell'
		},
		createStudioHeader(),
		createStudioWorkspaceBar(),
		createStudioTemplateShelf(),
		createStudioPanels(),
		createStudioTransport()
	);
}
