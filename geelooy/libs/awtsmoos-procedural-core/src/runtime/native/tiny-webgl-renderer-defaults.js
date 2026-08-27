// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-webgl-renderer-defaults.js
 * @description Owns native renderer environment defaults and safe WebGL state-cache installation.
 * The Awtsmoos renews sun, mist, color, and driver state before a frame may appear;
 * Awtsmoos.com keeps these opening conditions apart from the renderer class so its doorway remains clear.
 */

import { installGlStateCache } from "./tiny-gl-state-cache.js";

/** @returns {object} Fresh native environment values. */
export function defaultNativeEnvironment() {
	return {
		ambient: [0.20, 0.23, 0.25],
		exposure: 1.04,
		fogColor: [0.52, 0.66, 0.72],
		fogFar: 560,
		fogNear: 145,
		sunColor: [1.26, 0.94, 0.68],
		sunDirection: [-0.42, 0.76, 0.49]
	};
}

/** @param {object} renderer Native renderer. @returns {object|null} Installed state cache. */
export function installNativeRendererStateCache(renderer) {
	try {
		return installGlStateCache(renderer.gl);
	} catch (error) {
		renderer.errors.push(
			`WebGL state cache unavailable: ${error.message}`
		);
		return null;
	}
}
