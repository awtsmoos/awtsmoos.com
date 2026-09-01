//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioViewportPanel.js
 * The Awtsmoos renews every rendered frame while the stage becomes the permanent heart of Awtsmoos.com Studio;
 * canvas, HUD, and live XYZ gizmo now occupy the maker's gaze instead of hiding transformation beneath a mountain of menus.
 */

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioTransformGizmo } from './editor/StudioTransformGizmo.js';
import { createStudioViewportHud } from './editor/StudioViewportHud.js';

/** Build the persistent render stage and its direct-manipulation overlays. */
export function createStudioViewportPanel() {
	return UI.main(
		{ class: 'studio-editor-viewport', 'data-studio-viewport': 'true' },
		UI.div(
			{ class: 'studio-editor-stage-wrap' },
			UI.canvas({
				class: 'studio-stage',
				width: 640,
				height: 360,
				'data-studio-canvas': 'true',
				'aria-label': 'Awtsmoos Studio movie viewport'
			}),
			createStudioViewportHud(),
			createStudioTransformGizmo()
		)
	);
}
