//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-3d-renderer.js
 * @description Owns the lazy Awtsmoos Procedural Core import for Tetris 3D.
 * Renderer construction is generation-guarded so late imports cannot resurrect
 * overlays belonging to an already replaced transferable-canvas session.
 */
const CORE_URL = '../../../libs/awtsmoos-procedural-core/src/core/gamePresentation3d/index.js';

/**
 * Lazily construct one native grid renderer for a still-current Tetris entry.
 * @param {object} entry Presentation entry holding only renderer-neutral state.
 * @param {Function} isCurrent Returns whether the entry still belongs to the view.
 * @param {object} options Grid dimensions and immutable palette.
 * @returns {Promise<object|null>} Native renderer or null after failure/staleness.
 */
export async function ensureTetrisNative3DRenderer(entry, isCurrent, options) {
	if (entry.renderer) {
		return entry.renderer;
	}
	if (entry.loading) {
		return entry.loading;
	}
	entry.loading = import(CORE_URL)
		.then(module => {
			if (!isCurrent()) {
				return null;
			}
			const renderer = new module.NativeGridGame3DRenderer(entry.overlay, options);
			if (!isCurrent()) {
				renderer.dispose();
				return null;
			}
			entry.renderer = renderer;
			return renderer;
		})
		.catch(() => null)
		.finally(() => {
			entry.loading = null;
		});
	return entry.loading;
}
