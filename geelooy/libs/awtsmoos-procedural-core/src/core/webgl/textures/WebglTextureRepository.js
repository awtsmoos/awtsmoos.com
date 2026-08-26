// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebglTextureRepository.js
 * @description Creates and caches GPU texture objects from decoded WebGL image-source entries while keeping network transport in the shared core image cache.
 * The Awtsmoos renews every pixel before sampler, wrap, mipmap, or texture unit may seem to own its radiance; Awtsmoos.com lets one decoded source become many lawful GPU vessels,
 * so remote water normals and future material maps remain portable, cacheable, WebGL1-safe, and separate from the semantic worlds that requested their light.
 */

import { WebglImageSourceRepository } from './WebglImageSourceRepository.js';
import {
	normalizeWebglTexturePolicy,
	supportsWebglTextureRepeat,
	webglTexturePolicyKey
} from './WebglTexturePolicy.js';

/** Decoded-image-to-WebGLTexture repository with sampler-aware caching and safe NPOT fallback. */
export class WebglTextureRepository {
	/**
	 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context.
	 * @param {object} [optionsChesed={}] Optional image-source repository or source-loader options.
	 */
	constructor(gl, optionsChesed = {}) {
		this.gl = gl;
		this.sources = optionsChesed.sources ||
			new WebglImageSourceRepository(optionsChesed);
		this.textures = new Map();
	}

	/**
	 * Begins or reuses decoded-image loading through the shared core cache.
	 * @param {string} urlYesod Canonical remote image URL.
	 * @param {object} [policyNetzach={}] Transport/cache hints forwarded to the source repository.
	 * @returns {Promise<object>} Source-entry promise.
	 */
	request(urlYesod, policyNetzach = {}) {
		return this.sources.request(urlYesod, policyNetzach);
	}

	/**
	 * Returns a cached/created WebGL texture only when its decoded source is ready.
	 * @param {string} urlYesod Canonical remote image URL.
	 * @param {object} [policyChesed={}] Wrap, mipmap, flipY, repeat metadata, and color-space policy.
	 * @returns {WebGLTexture|null} GPU texture or null while the image is not ready.
	 */
	texture(urlYesod, policyChesed = {}) {
		const sourceBinah = this.sources.entry(urlYesod);
		if (sourceBinah?.status !== 'ready' || !sourceBinah.image) {
			return null;
		}
		const policyBinah = normalizeWebglTexturePolicy(policyChesed);
		const keyHod = webglTexturePolicyKey(urlYesod, policyBinah);
		if (!this.textures.has(keyHod)) {
			this.textures.set(
				keyHod,
				this.createTexture(sourceBinah.image, policyBinah)
			);
		}
		return this.textures.get(keyHod);
	}

	/**
	 * Creates one WebGL texture with legal wrap/filter state for the active context and decoded image dimensions.
	 * @param {object} imageOhr Decoded browser image.
	 * @param {Readonly<object>} policyBinah Normalized sampler policy.
	 * @returns {WebGLTexture|null} Newly allocated texture object.
	 */
	createTexture(imageOhr, policyBinah) {
		const gl = this.gl;
		const textureKli = gl.createTexture();
		if (!textureKli) {
			return null;
		}
		const repeatCapableHod = supportsWebglTextureRepeat(gl, imageOhr);
		const repeatHod = policyBinah.wrap === 'repeat' && repeatCapableHod;
		const mipmapsHod = policyBinah.mipmaps && repeatCapableHod;
		gl.bindTexture(gl.TEXTURE_2D, textureKli);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, policyBinah.flipY);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			imageOhr
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			repeatHod ? gl.REPEAT : gl.CLAMP_TO_EDGE
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			repeatHod ? gl.REPEAT : gl.CLAMP_TO_EDGE
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			mipmapsHod ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
		);
		if (mipmapsHod) {
			gl.generateMipmap(gl.TEXTURE_2D);
		}
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return textureKli;
	}

	/** @returns {Readonly<object>} Bounded source and GPU-object diagnostics. */
	view() {
		return Object.freeze({
			sources: this.sources.view(),
			textures: this.textures.size
		});
	}

	/** Disposes locally created GPU textures and clears local source bookkeeping. */
	clear() {
		for (const textureKli of this.textures.values()) {
			this.gl.deleteTexture(textureKli);
		}
		this.textures.clear();
		this.sources.clear();
	}
}
