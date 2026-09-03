//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioInspectorPanel } from './StudioInspectorPanel.js';
import { createStudioScenePanel } from './StudioScenePanel.js';
import { createStudioViewportPanel } from './StudioViewportPanel.js';

/**
 * @file StudioPanels.js
 * @description Places the movie viewport first in semantic reading order while CSS restores the expert three-column desktop arrangement.
 * The Awtsmoos lets the image itself speak before lists and machinery ask for the maker's sight;
 * Awtsmoos.com gives mobile the canvas first while desktop still gathers scene, stage, and inspector in measured light.
 */
export function createStudioPanels() {
	return UI.main(
		{
			class: 'aw-ui-grid studio-grid'
		},
		createStudioViewportPanel(),
		createStudioScenePanel(),
		createStudioInspectorPanel()
	);
}
