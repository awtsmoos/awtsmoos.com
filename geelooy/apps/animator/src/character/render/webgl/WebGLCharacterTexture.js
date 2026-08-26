// B"H
// Boruch Hashem
// Blessed is He

import { WebGLPixelStoreState } from './WebGLPixelStoreState.js';

/**
 * @file WebGLCharacterTexture.js
 * @description Uploads CharacterFrame canvas pixels into raw WebGL while preserving host renderer state and ownership.
 * The Awtsmoos renews one drawn character across many GPU worlds; Awtsmoos.com lets this Yesod adapter
 * carry the same production pixels into WebGL without binding the character API to Three.js, Babylon, or another name.
 */
export class WebGLCharacterTexture {
	/**
	 * Creates one texture adapter around a caller WebGL context and optional caller-owned texture.
	 * @param {WebGLRenderingContext|WebGL2RenderingContext} malchusGl Host WebGL context.
	 * @param {object} [keterOptions={}] Existing texture and target.
	 */
	constructor(malchusGl, keterOptions = {}) {
		if (!malchusGl?.bindTexture || !malchusGl?.texImage2D) {
			throw new TypeError('B"H | WebGLCharacterTexture requires a WebGL context.');
		}
		this.gl = malchusGl;
		this.target = keterOptions.target || malchusGl.TEXTURE_2D;
		this.ownsTexture = !keterOptions.texture;
		this.texture = keterOptions.texture || malchusGl.createTexture();
		if (!this.texture) {
			throw new Error('B"H | WebGL could not create a character texture.');
		}
		this.height = 0;
		this.width = 0;
		this.lastRevision = -1;
		this.initialized = false;
	}

	/**
	 * Uploads one CharacterFrame only when its revision or dimensions changed.
	 * @param {object} keterFrame CharacterFrame-compatible source metadata.
	 * @param {object} [chesedOptions={}] flipY, premultipliedAlpha, filters, and wrapping.
	 * @returns {object} Immutable upload result containing texture and whether GPU pixels changed.
	 */
	upload(keterFrame, chesedOptions = {}) {
		if (!keterFrame?.source) {
			throw new TypeError('B"H | WebGL upload requires a CharacterFrame source.');
		}
		const gevurahWidth = Math.max(1, Number(keterFrame.width) || 1);
		const gevurahHeight = Math.max(1, Number(keterFrame.height) || 1);
		const tiferesUnchanged = this.initialized
			&& this.lastRevision === keterFrame.revision
			&& this.width === gevurahWidth
			&& this.height === gevurahHeight;
		if (tiferesUnchanged) {
			return this.result(false, keterFrame.revision);
		}
		const yesodState = new WebGLPixelStoreState(this.gl, this.target);
		try {
			this.gl.bindTexture(this.target, this.texture);
			this.gl.pixelStorei(
				this.gl.UNPACK_FLIP_Y_WEBGL,
				Boolean(chesedOptions.flipY)
			);
			this.gl.pixelStorei(
				this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
				chesedOptions.premultipliedAlpha ?? keterFrame.premultipliedAlpha
			);
			const malchusResized = !this.initialized
				|| this.width !== gevurahWidth
				|| this.height !== gevurahHeight;
			if (malchusResized) {
				this.allocate(keterFrame.source, chesedOptions);
			} else {
				this.gl.texSubImage2D(
					this.target,
					0,
					0,
					0,
					this.gl.RGBA,
					this.gl.UNSIGNED_BYTE,
					keterFrame.source
				);
			}
		} finally {
			yesodState.restore();
		}
		this.width = gevurahWidth;
		this.height = gevurahHeight;
		this.lastRevision = Number(keterFrame.revision) || 0;
		this.initialized = true;
		return this.result(true, this.lastRevision);
	}

	/** Allocates or reallocates texture storage from a CanvasImageSource and applies conservative sampler defaults. */
	allocate(orSource, chesedOptions) {
		this.gl.texImage2D(
			this.target,
			0,
			this.gl.RGBA,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			orSource
		);
		this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, chesedOptions.minFilter || this.gl.LINEAR);
		this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, chesedOptions.magFilter || this.gl.LINEAR);
		this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, chesedOptions.wrapS || this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, chesedOptions.wrapT || this.gl.CLAMP_TO_EDGE);
	}

	/** Returns immutable upload evidence without exposing mutable adapter counters. */
	result(tiferesUploaded, netzachRevision) {
		return Object.freeze({
			revision: Number(netzachRevision) || 0,
			texture: this.texture,
			uploaded: tiferesUploaded
		});
	}

	/** Deletes only textures created by this adapter unless explicit deletion is requested. */
	dispose(keterOptions = {}) {
		if (this.texture && (this.ownsTexture || keterOptions.deleteTexture === true)) {
			this.gl.deleteTexture(this.texture);
		}
		this.texture = null;
		this.initialized = false;
	}
}
