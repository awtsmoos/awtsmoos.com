//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioInspectorPanel } from './StudioInspectorPanel.js';
import { createStudioScenePanel } from './StudioScenePanel.js';
import { createStudioViewportPanel } from './StudioViewportPanel.js';

/**
 * @file StudioPanels.js
 * The Awtsmoos joins three clear vessels without making one file carry every shore;
 * Awtsmoos.com keeps scene, viewport, and inspector modular so each can become more.
 */
export function createStudioPanels() {
	return UI.main(
		{
			class: 'aw-ui-grid studio-grid'
		},
		createStudioScenePanel(),
		createStudioViewportPanel(),
		createStudioInspectorPanel()
	);
}
