// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gpu-texture-cache.js
 * @description Owns original-image GPU residency with unit-aware binding reuse.
 * The Awtsmoos renews each source without resampling it; Awtsmoos.com changes the active unit
 * only when that unit truly needs a different texture, avoiding empty WebGL state oscillation.
 */

import {
	createGpuTextureStats,
	gpuTextureDiagnostics,
	recordGpuTextureUpload
} from './tiny-gpu-texture-diagnostics.js';
import {
	createDefaultTexture,
	isPowerOfTwo,
	setTextureParameters,
	sourceHeight,
	sourceWidth
} from './tiny-texture-source.js';

export class GpuTextureCache {
	constructor(gl) {
		this.gl = gl;
		this.cache = new WeakMap();
		this.defaultTexture = createDefaultTexture(gl);
		this.activeUnit = 0;
		this.boundTextures = new Map([[0, this.defaultTexture]]);
		this.anisotropy = gl.getExtension('EXT_texture_filter_anisotropic')
			|| gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
		this.stats = createGpuTextureStats();
	}

	bind(unit, uniform, texture) {
		if (this.boundTextures.get(unit) !== texture) {
			this.activateUnit(unit);
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.boundTextures.set(unit, texture);
			this.stats.bindingChanges += 1;
		} else {
			this.stats.bindingSkips += 1;
			this.stats.activeUnitSkips += 1;
		}
		if (uniform) this.gl.uniform1i(uniform, unit);
	}

	activateUnit(unit) {
		if (this.activeUnit === unit) {
			this.stats.activeUnitSkips += 1;
			return;
		}
		this.gl.activeTexture(this.gl.TEXTURE0 + unit);
		this.activeUnit = unit;
		this.stats.activeUnitChanges += 1;
	}

	textureFor(source, material) {
		if (this.cache.has(source)) {
			this.stats.cacheHits += 1;
			return this.cache.get(source);
		}
		this.stats.uploadAttempts += 1;
		const texture = this.gl.createTexture();
		const width = sourceWidth(source);
		const height = sourceHeight(source);
		const powerOfTwo = isPowerOfTwo(width) && isPowerOfTwo(height);
		try {
			this.upload(texture, source, width, height, powerOfTwo, material);
			this.cache.set(source, texture);
			this.stats.uploads += 1;
			recordGpuTextureUpload(this.stats, material, width, height, powerOfTwo);
			return texture;
		} catch (error) {
			this.stats.uploadFailures += 1;
			this.stats.lastError = error?.message || String(error);
			this.gl.deleteTexture?.(texture);
			// B"H: a bad texture must never kill the frame. Cache the fallback so we
			// do not retry a doomed upload every frame.
			this.cache.set(source, this.defaultTexture);
			return this.defaultTexture;
		}
	}

	upload(texture, source, width, height, powerOfTwo, material) {
		const gl = this.gl;
		this.activateUnit(0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		this.boundTextures.set(0, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		const pixelData = resolvePixelData(source);
		if (pixelData) {
			// B"H: raw generated texture field {width,height,data} — use the sized-data
			// overload. A plain object is not a valid TexImageSource for the 6-arg form.
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
		} else if (isUploadableSource(source)) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		} else {
			throw new TypeError(
				'GpuTextureCache.upload: source is not uploadable ' +
				`(width=${width}, height=${height}, hasData=${Boolean(source?.data)})`
			);
		}
		if (powerOfTwo) gl.generateMipmap(gl.TEXTURE_2D);
		setTextureParameters(
			gl,
			powerOfTwo ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
			gl.LINEAR,
			powerOfTwo ? gl.REPEAT : gl.CLAMP_TO_EDGE
		);
		this.applyAnisotropy(material);
	}

	applyAnisotropy(material) {
		if (!this.anisotropy || material?.anisotropy === false) return;
		const gl = this.gl;
		const maximum = gl.getParameter(this.anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
		const requested = material?.anisotropy === true ? 4 : Number(material?.anisotropy || 2);
		gl.texParameterf(
			gl.TEXTURE_2D,
			this.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
			Math.min(requested, maximum)
		);
	}

	diagnostics() {
		return gpuTextureDiagnostics(this.stats);
	}
}

/**
 * B"H: resolves a raw pixel field ({width,height,data}) to an uploadable typed array.
 * Returns null when the source carries no pixel data (DOM TexImageSource path).
 */
function resolvePixelData(source) {
	const data = source?.data;
	if (!data) return null;
	if (ArrayBuffer.isView(data)) return data;
	if (Array.isArray(data)) return new Uint8Array(data);
	return null;
}

/**
 * B"H: true when the source is a DOM TexImageSource WebGL can consume directly.
 * Plain {width,height,data} fields are handled by resolvePixelData, not here.
 */
function isUploadableSource(source) {
	if (!source || typeof source !== 'object') return false;
	if (source.data) return false;
	// DOM elements (canvas, image, video) and ImageBitmap/ImageData/VideoFrame.
	if (typeof HTMLElement !== 'undefined' && source instanceof HTMLElement) return true;
	if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) return true;
	if (typeof ImageData !== 'undefined' && source instanceof ImageData) return true;
	if (typeof VideoFrame !== 'undefined' && source instanceof VideoFrame) return true;
	// OffscreenCanvas or other canvas-like with getContext.
	if (typeof source.getContext === 'function') return true;
	return false;
}
