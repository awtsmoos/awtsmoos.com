//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Native3DPresentationLifecycle.js
 * @description Releases optional Connect 4 render vessels without touching the
 * authoritative Worker, accepted board state, game result, or semantic controls.
 */

/**
 * Release one mounted native 3D presentation generation.
 * @param {object} presentation Presentation owner to reset in place.
 */
export function releaseConnect4Native3DPresentation(presentation) {
	presentation.generation += 1;
	presentation.renderer?.dispose();
	presentation.renderer = null;
	presentation.loading = null;
	presentation.board = null;
	if (presentation.source && presentation.wrapper?.isConnected) {
		presentation.wrapper.before(presentation.source);
	}
	presentation.overlay?.remove();
	presentation.wrapper?.remove();
	if (presentation.source) {
		presentation.source.style.opacity = '';
	}
	presentation.source = null;
	presentation.overlay = null;
	presentation.wrapper = null;
}
