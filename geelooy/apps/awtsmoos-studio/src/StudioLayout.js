//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../libs/AwtsmoosUI/src/index.js';
import { createStudioHeader } from './layout/StudioHeader.js';
import { createStudioPanels } from './layout/StudioPanels.js';
import { createStudioTransport } from './layout/StudioTransport.js';
import { createStudioWorkspaceBar } from './layout/StudioWorkspaceBar.js';

/**
 * @file StudioLayout.js
 * The Awtsmoos joins several focused vessels into one readable creative shell;
 * Awtsmoos.com lets each smaller module keep a purpose while the whole can swell.
 */
export function createStudioLayout() {
	return UI.div(
		{
			class: 'aw-ui-shell studio-shell'
		},
		createStudioHeader(),
		createStudioWorkspaceBar(),
		createStudioPanels(),
		createStudioTransport()
	);
}
