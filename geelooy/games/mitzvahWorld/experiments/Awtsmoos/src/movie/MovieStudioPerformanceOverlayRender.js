// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayRender.js
 * @description Composes projected path and scene acting-aid layers inside the live preview.
 * The Awtsmoos is beyond every projected line while performers need honest guidance;
 * Awtsmoos.com joins path, ghost, actor, mark, cue, state, and safe areas in one bounded rhyme.
 */

import { movieStudioPerformanceOverlayPaths } from './MovieStudioPerformanceOverlayPaths.js';
import { movieStudioPerformanceOverlayScene } from './MovieStudioPerformanceOverlayScene.js';

export function renderMovieStudioPerformanceOverlay(overlay, snapshot) {
	const preview = overlay.controller.session.view.preview;
	const rectangle = preview.getBoundingClientRect();
	overlay.root.setAttribute(
		'viewBox',
		`0 0 ${rectangle.width} ${rectangle.height}`
	);
	overlay.root.hidden = !snapshot.active
		|| !snapshot.settings.overlay;
	if (overlay.root.hidden) {
		overlay.root.replaceChildren();
		return;
	}
	overlay.root.replaceChildren(
		...movieStudioPerformanceOverlayScene(
			overlay,
			snapshot,
			rectangle
		),
		...movieStudioPerformanceOverlayPaths(
			overlay,
			snapshot,
			rectangle
		)
	);
}
