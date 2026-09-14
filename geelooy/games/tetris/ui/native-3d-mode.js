//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-3d-mode.js
 * @description Applies Tetris presentation switching only after optional native
 * rendering succeeds, guaranteeing WebGL failure can never hide playable 2D truth.
 *
 * Sizing invariant:
 * - A successful overlay becomes layout-visible before renderer activation so its
 *   intrinsic WebGL buffer is measured from the real board instead of hidden 0×0 CSS.
 */

/**
 * Apply one visual-mode request across all current Tetris board projections.
 * @param {object} presentation Tetris presentation owner.
 * @param {boolean} active Requested optional 3D state.
 */
export function applyTetrisNative3DMode(presentation, active) {
	presentation.active = Boolean(active);
	for (const entry of presentation.entries.values()) {
		if (!presentation.active) {
			showSource(entry);
			continue;
		}
		showSource(entry);
		presentation.ensureRenderer(entry).then(renderer => {
			if (!renderer || !isCurrent(presentation, entry)) {
				return;
			}
			entry.overlay.hidden = false;
			renderer.setActive(true);
			if (entry.grid) {
				renderer.update(entry.grid);
			}
			entry.source.style.opacity = '0';
		});
	}
}

/** Keep the Worker canvas visible and stop optional renderer ownership. */
function showSource(entry) {
	entry.overlay.hidden = true;
	entry.source.style.opacity = '';
	entry.renderer?.setActive(false);
}

/** Confirm an asynchronous renderer still belongs to the requested active mode. */
function isCurrent(presentation, entry) {
	return presentation.active
		&& presentation.entries.get(entry.id) === entry
		&& entry.generation === presentation.generation;
}
