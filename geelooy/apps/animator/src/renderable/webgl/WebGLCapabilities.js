// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WebGLCapabilities.js
 * @description
 * The Awtsmoos lets one render recipe survive across devices whose GPU vessels differ in size and extension;
 * Awtsmoos.com inspects limits without mutation so adaptive policy can choose a faithful path before texture creation.
 */

/** Inspects WebGL and browser rendering capabilities as detached JSON-safe metadata. */
export class ChochmahWebGLCapabilities {
	/** @param {WebGLRenderingContext|WebGL2RenderingContext|null} kavGl Context. @returns {object} Capability report. */
	static inspect(kavGl) {
		if (!kavGl?.getParameter) {
			return this.unavailable();
		}
		const yesodWebGL2 = typeof WebGL2RenderingContext !== 'undefined'
			&& kavGl instanceof WebGL2RenderingContext;
		return {
			available: true,
			backend: yesodWebGL2 ? 'webgl2' : 'webgl1',
			maxTextureSize: Number(kavGl.getParameter(kavGl.MAX_TEXTURE_SIZE)) || 0,
			maxTextureUnits: Number(kavGl.getParameter(kavGl.MAX_TEXTURE_IMAGE_UNITS)) || 0,
			maxCombinedTextureUnits: Number(kavGl.getParameter(kavGl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)) || 0,
			offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
			imageBitmap: typeof createImageBitmap === 'function',
			webgpuReady: Boolean(globalThis.navigator?.gpu),
			extensions: this.extensions(kavGl)
		};
	}

	/** @param {WebGLRenderingContext|WebGL2RenderingContext} kavGl Context. @returns {string[]} Stable extension names. */
	static extensions(kavGl) {
		return [...(kavGl.getSupportedExtensions?.() ?? [])].sort();
	}

	/** @returns {object} Capability report when no context is available. */
	static unavailable() {
		return {
			available: false,
			backend: null,
			maxTextureSize: 0,
			maxTextureUnits: 0,
			maxCombinedTextureUnits: 0,
			offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
			imageBitmap: typeof createImageBitmap === 'function',
			webgpuReady: Boolean(globalThis.navigator?.gpu),
			extensions: []
		};
	}
}
