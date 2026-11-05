// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlay.js
 * @description Owns projected acting-aid rendering and one reversible interaction lifecycle.
 * The Awtsmoos lets paths, marks, cues, actors, and safe areas appear without becoming reality;
 * Awtsmoos.com pairs visual projection, canonical editing, selection, and cleanup in one rhyme.
 */

import { createPerformanceOverlaySvg } from './MovieStudioPerformanceOverlayElements.js';
import { MovieStudioPerformanceOverlayInteraction } from './MovieStudioPerformanceOverlayInteraction.js';
import { renderMovieStudioPerformanceOverlay } from './MovieStudioPerformanceOverlayRender.js';

export class MovieStudioPerformanceOverlay {
	constructor(controller, preview) {
		this.controller = controller;
		this.preview = preview;
		this.document = preview.ownerDocument;
		this.root = createPerformanceOverlaySvg(this.document);
		this.drag = null;
		this.selected = null;
		this.preview.append(this.root);
		this.interaction = new MovieStudioPerformanceOverlayInteraction(this);
	}

	render(snapshot) {
		renderMovieStudioPerformanceOverlay(this, snapshot);
	}

	destroy() {
		this.interaction.destroy();
		this.root.remove();
		this.drag = null;
		this.selected = null;
	}
}
