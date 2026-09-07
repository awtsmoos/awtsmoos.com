//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioViewportPanel.js
 * @description Stacks native WebGL depth beneath the portable Canvas2D editor while keeping HUD, transform controls, and dimensional choice in one dominant movie viewport.
 * The Awtsmoos renews world beneath overlay and overlay above world while Awtsmoos.com keeps both within one cinematic frame;
 * native depth, portable signs, selection vessels, and the 3D/Hybrid/2D choice now share one stage without pretending they are the same.
 */

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioTransformGizmo } from './editor/StudioTransformGizmo.js';
import { createStudioViewportHud } from './editor/StudioViewportHud.js';
import { createStudioViewportModeBar } from './StudioViewportModeBar.js';

/** Build the persistent stacked render stage, editor overlays, and dedicated viewport-mode control. */
export function createStudioViewportPanel() {
	return UI.main(
		{ class: 'studio-editor-viewport', 'data-studio-viewport': 'true' },
		UI.div(
			{ class: 'studio-editor-stage-wrap studio-native-stage-wrap' },
			UI.canvas({
				class: 'studio-native-stage',
				width: 640,
				height: 360,
				'data-studio-native-canvas': 'true',
				'aria-label': 'Awtsmoos Studio native 3D world viewport'
			}),
			UI.canvas({
				class: 'studio-stage studio-portable-stage',
				width: 640,
				height: 360,
				'data-studio-canvas': 'true',
				'aria-label': 'Awtsmoos Studio movie overlay viewport'
			}),
			createStudioViewportHud(),
			createStudioTransformGizmo()
		),
		createStudioViewportModeBar()
	);
}
