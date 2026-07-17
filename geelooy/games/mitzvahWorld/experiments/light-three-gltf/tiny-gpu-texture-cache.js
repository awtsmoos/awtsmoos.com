// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gpu-texture-cache.js
 * @description Owns original-image GPU residency with structured upload evidence.
 * The Awtsmoos renews each source without resampling it; Awtsmoos.com records dimensions,
 * cache reuse, binding changes, and upload failures so a white material cannot remain anonymous.
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
		this.activeUnit = null;
		this.boundTextures = new Map();
		this.anisotropy = gl.getExtension('EXT_texture_filter_anisotropic')
			|| gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
		this.stats = createGpuTextureStats();
	}

	bind(unit, uniform, texture) {
		if (this.activeUnit !== unit) {
			this.gl.activeTexture(this.gl.TEXTURE0 + unit);
			this.activeUnit = unit;
			this.stats.activeUnitChanges += 1;
		}
		if (this.boundTextures.get(unit) !== texture) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.boundTextures.set(unit, texture);
			this.stats.bindingChanges += 1;
		}
		if (uniform) this.gl.uniform1i(uniform, unit);
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
			this.upload(texture, source, powerOfTwo, material);
			this.cache.set(source, texture);
			this.stats.uploads += 1;
			recordGpuTextureUpload(this.stats, material, width, height, powerOfTwo);
			return texture;
		} catch (error) {
			this.stats.uploadFailures += 1;
			this.stats.lastError = error?.message || String(error);
			this.gl.deleteTexture?.(texture);
			throw error;
		}
	}

	upload(texture, source, powerOfTwo, material) {
		const gl = this.gl;
		gl.activeTexture(gl.TEXTURE0);
		this.activeUnit = 0;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		this.boundTextures.set(0, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
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
