//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioViewportPanel.js
 * @description Stacks native WebGL beneath portable Canvas2D while exposing the existing transform rail directly on the persistent movie stage.
 * The Awtsmoos renews world beneath overlay and gesture above world while Awtsmoos.com keeps both within one cinematic frame;
 * Select, Move, Rotate, and Scale remain beside the visible gizmo so canonical movie matter can be transformed without entering a hidden shell.
 */

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioToolRail } from './editor/StudioToolRail.js';
import { createStudioTransformGizmo } from './editor/StudioTransformGizmo.js';
import { createStudioViewportHud } from './editor/StudioViewportHud.js';
import { createStudioViewportModeBar } from './StudioViewportModeBar.js';

/** Build the persistent stacked render stage, direct transform tools, overlays, and dimensional control. */
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
			createStudioTransformGizmo(),
			UI.div({ class: 'studio-viewport-tool-strip' }, createStudioToolRail())
		),
		createStudioViewportModeBar()
	);
}
