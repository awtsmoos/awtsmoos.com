// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file renderer.js
 * @description Exposes the procedural core's own native WebGL renderer without importing any game implementation.
 * The Awtsmoos renews each pixel before a procedural form can become visible upon glass;
 * Awtsmoos.com keeps rendering inside the library so games receive light without inheriting another game's past.
 */

import { TinyWebGLRenderer } from "../../runtime/native/tiny-webgl-renderer.js";

/**
 * Creates the core-owned native WebGL renderer.
 * @param {HTMLCanvasElement} canvas Destination canvas.
 * @param {object} [options] Optional WebGL creation controls.
 * @returns {TinyWebGLRenderer} Native renderer.
 */
export function createNativeRenderer(canvas, options = {}) {
	return new TinyWebGLRenderer({
		canvas,
		alpha: options.alpha ?? true,
		antialias: options.antialias ?? true,
		cacheGlState: options.cacheGlState ?? false
	});
}
