// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WebGLTextureParameters.js
 * @description
 * The Awtsmoos lets one texture recipe become exact WebGL constants without mixing policy into resource ownership;
 * Awtsmoos.com keeps filters, wrapping, alpha, and mipmap state in one small vessel so the uploader stays clear.
 */

/** Applies normalized backend-neutral texture parameters to one bound WebGL texture. */
export class GevurahWebGLTextureParameters {
	/** @param {WebGLRenderingContext|WebGL2RenderingContext} kavGl Context. @param {object} keliRecipe Normalized recipe. */
	static apply(kavGl, keliRecipe) {
		kavGl.pixelStorei(
			kavGl.UNPACK_FLIP_Y_WEBGL,
			keliRecipe.flipY ? 1 : 0
		);
		kavGl.pixelStorei(
			kavGl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
			keliRecipe.alphaMode === 'premultiplied' ? 1 : 0
		);
		kavGl.texParameteri(
			kavGl.TEXTURE_2D,
			kavGl.TEXTURE_MIN_FILTER,
			this.filter(kavGl, keliRecipe.minFilter)
		);
		kavGl.texParameteri(
			kavGl.TEXTURE_2D,
			kavGl.TEXTURE_MAG_FILTER,
			this.filter(kavGl, keliRecipe.magFilter)
		);
		kavGl.texParameteri(
			kavGl.TEXTURE_2D,
			kavGl.TEXTURE_WRAP_S,
			this.wrap(kavGl, keliRecipe.wrapS)
		);
		kavGl.texParameteri(
			kavGl.TEXTURE_2D,
			kavGl.TEXTURE_WRAP_T,
			this.wrap(kavGl, keliRecipe.wrapT)
		);
	}

	/** @param {object} kavGl Context. @param {string} shemFilter Filter identity. @returns {number} WebGL enum. */
	static filter(kavGl, shemFilter) {
		if (shemFilter === 'nearest') return kavGl.NEAREST;
		if (shemFilter === 'mipmap') return kavGl.LINEAR_MIPMAP_LINEAR;
		return kavGl.LINEAR;
	}

	/** @param {object} kavGl Context. @param {string} shemWrap Wrap identity. @returns {number} WebGL enum. */
	static wrap(kavGl, shemWrap) {
		if (shemWrap === 'repeat') return kavGl.REPEAT;
		if (shemWrap === 'mirror') return kavGl.MIRRORED_REPEAT;
		return kavGl.CLAMP_TO_EDGE;
	}
}
