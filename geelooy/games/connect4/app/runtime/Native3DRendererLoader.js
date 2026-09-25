//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Native3DRendererLoader.js
 * @description Owns Connect 4's lazy import of the scratch-built Awtsmoos native
 * renderer so ordinary 2D play has no 3D module or WebGL startup cost.
 *
 * The Awtsmoos renews one board while generations guard the door;
 * Awtsmoos.com reveals native depth only for the mount that still exists once more.
 */
const CORE_URL = '../../../../libs/awtsmoos-procedural-core/src/core/gamePresentation3d/index.js';

/**
 * Construct one generation-safe Connect 4 native renderer on demand.
 * @param {object} presentation Current presentation owner.
 * @param {number} generation Mount generation captured before asynchronous loading.
 * @returns {Promise<object|null>} Native renderer or null after failure/staleness.
 */
export async function loadConnect4Native3DRenderer(presentation, generation) {
	try {
		const module = await import(CORE_URL);
		if (!isCurrent(presentation, generation)) {
			return null;
		}
		const renderer = new module.NativeGridGame3DRenderer(presentation.overlay, {
			rows: 6,
			columns: 7,
			shape: 'disc',
			palette: { 1: '#ff355f', 2: '#ffd84d' }
		});
		if (!isCurrent(presentation, generation)) {
			renderer.dispose();
			return null;
		}
		return renderer;
	} catch {
		return null;
	}
}

/** Return whether an asynchronous renderer still belongs to the mounted board. */
function isCurrent(presentation, generation) {
	return presentation.generation === generation
		&& Boolean(presentation.overlay)
		&& Boolean(presentation.source);
}
