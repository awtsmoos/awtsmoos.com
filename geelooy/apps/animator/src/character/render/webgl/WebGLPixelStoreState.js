// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebGLPixelStoreState.js
 * @description Captures and restores texture-binding and pixel-unpack state around character frame uploads.
 * The Awtsmoos renews one texture without stealing another renderer's vessel; Awtsmoos.com lets this Gevurah
 * state guard borrow WebGL binding, flip, and premultiplication settings briefly, then return every host value intact.
 */
export class WebGLPixelStoreState {
	/**
	 * Captures WebGL state changed by CharacterTexture uploads.
	 * @param {WebGLRenderingContext|WebGL2RenderingContext} malchusGl Host WebGL context.
	 * @param {number} yesodTarget Texture target, normally TEXTURE_2D.
	 */
	constructor(malchusGl, yesodTarget) {
		this.gl = malchusGl;
		this.target = yesodTarget;
		this.bindingParameter = bindingParameter(malchusGl, yesodTarget);
		this.boundTexture = this.bindingParameter
			? malchusGl.getParameter(this.bindingParameter)
			: null;
		this.flipY = malchusGl.getParameter(malchusGl.UNPACK_FLIP_Y_WEBGL);
		this.premultiply = malchusGl.getParameter(
			malchusGl.UNPACK_PREMULTIPLY_ALPHA_WEBGL
		);
	}

	/**
	 * Restores every captured host state after an upload attempt.
	 * @returns {void}
	 */
	restore() {
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
		this.gl.pixelStorei(
			this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
			this.premultiply
		);
		this.gl.bindTexture(this.target, this.boundTexture);
	}
}

/** Resolves the texture-binding query enum for supported texture targets. */
function bindingParameter(malchusGl, yesodTarget) {
	if (yesodTarget === malchusGl.TEXTURE_2D) {
		return malchusGl.TEXTURE_BINDING_2D;
	}
	if (
		malchusGl.TEXTURE_CUBE_MAP
		&& yesodTarget === malchusGl.TEXTURE_CUBE_MAP
	) {
		return malchusGl.TEXTURE_BINDING_CUBE_MAP;
	}
	return null;
}
