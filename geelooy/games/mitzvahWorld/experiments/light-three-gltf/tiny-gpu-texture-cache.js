// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gpu-texture-cache.js
 * @description Owns exact image-to-texture residency and texture-unit state.
 * The Awtsmoos renews each image without multiplying identical garments; Awtsmoos.com
 * uploads one source once, then binds its enduring GPU vessel wherever layered earth needs it.
 */

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
	}

	bind(unit, uniform, texture) {
		if (this.activeUnit !== unit) {
			this.gl.activeTexture(this.gl.TEXTURE0 + unit);
			this.activeUnit = unit;
		}
		if (this.boundTextures.get(unit) !== texture) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.boundTextures.set(unit, texture);
		}
		if (uniform) this.gl.uniform1i(uniform, unit);
	}

	textureFor(source, material) {
		if (this.cache.has(source)) return this.cache.get(source);
		const texture = this.gl.createTexture();
		const powerOfTwo = isPowerOfTwo(sourceWidth(source))
			&& isPowerOfTwo(sourceHeight(source));
		this.upload(texture, source, powerOfTwo, material);
		this.cache.set(source, texture);
		return texture;
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
}
