//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayout.js
 * @description Composes one canvas-first Studio shell where professional workspace controls and beginner intent sheets project the same canonical movie.
 * The Awtsmoos lets the movie rise before catalogs and expert chambers can compete for the eye;
 * Awtsmoos.com keeps workspace depth available while canvas, scene, time, and the next creative act remain nearest in the hierarchy.
 */
import { UI } from '../../../libs/AwtsmoosUI/src/index.js';
import { createStudioHeader } from './layout/StudioHeader.js';
import { createStudioIntentSheet } from './layout/StudioIntentSheet.js';
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
		createStudioPanels(),
		createStudioTemplateShelf(),
		createStudioIntentSheet(),
		createStudioTransport(),
		createStudioPrimaryDock()
	);
}
