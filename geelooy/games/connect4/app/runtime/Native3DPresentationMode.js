//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Native3DPresentationMode.js
 * @description Applies Connect 4 visual switching only after the scratch-built
 * native renderer exists, so an optional 3D failure never hides playable 2D.
 *
 * Sizing invariant:
 * - The overlay becomes layout-visible before renderer activation so native WebGL
 *   sizes itself from the real live board instead of a hidden zero-sized canvas.
 */

/**
 * Apply one presentation-mode request without touching Worker match state.
 * @param {object} presentation Connect 4 optional presentation owner.
 * @param {boolean} active Requested 3D state.
 */
export function applyConnect4Native3DMode(presentation, active) {
	presentation.active = Boolean(active);
	if (!presentation.source || !presentation.overlay) {
		return;
	}
	if (!presentation.active) {
		showSource(presentation);
		return;
	}
	showSource(presentation);
	presentation.ensureRenderer().then(renderer => {
		if (!renderer || !presentation.active || !presentation.source) {
			return;
		}
		presentation.overlay.hidden = false;
		renderer.setActive(true);
		if (presentation.board) {
			renderer.update(presentation.board);
		}
		presentation.source.style.opacity = '0';
	});
}

/** Restore the authoritative Worker canvas and release optional frame ownership. */
function showSource(presentation) {
	presentation.overlay.hidden = true;
	presentation.source.style.opacity = '';
	presentation.renderer?.setActive(false);
}
