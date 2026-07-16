// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-textures.js
 * @description Binds exact image identities while reusing unchanged adjacent texture state.
 * The Awtsmoos renews every roof grain and river ripple; Awtsmoos.com remembers the
 * currently bound garment without ever confusing one ready image for another.
 */

import {
	addMapStats,
	addMixStats
} from './tiny-render-texture-stats.js';
import {
	sameTextureState,
	textureState
} from './tiny-texture-state.js';
import {
	createDefaultTexture,
	isPowerOfTwo,
	setTextureParameters,
	sourceHeight,
	sourceWidth
} from './tiny-texture-source.js';

export class MaterialTextureBinder {
	constructor(gl) {
		this.gl = gl;
		this.cache = new WeakMap();
		this.defaultTexture = createDefaultTexture(gl);
		this.activeUnit = null;
		this.boundTextures = new Map();
		this.previous = null;
		this.aniso = gl.getExtension('EXT_texture_filter_anisotropic')
			|| gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
	}

	bind(locations, material = {}, stats) {
		const state = textureState(material);
		if (state.mapReady) addMapStats(material, stats);
		if (state.mixReady) addMixStats(material, stats);
		if (sameTextureState(this.previous, state)) {
			stats.textureStateSkips = (stats.textureStateSkips || 0) + 1;
			return;
		}
		this.previous = state;
		stats.textureStateUploads = (stats.textureStateUploads || 0) + 1;
		this.bindMap(locations, material, state);
		this.bindMix(locations, material, state);
	}

	bindMap(locations, material, state) {
		const texture = state.mapReady
			? this.textureFor(state.mapImage, material)
			: this.defaultTexture;
		this.bindOne(1, locations.map, texture);
		this.gl.uniform1i(locations.useMap, state.mapReady ? 1 : 0);
		this.gl.uniform2f(locations.mapRepeat, state.mapRepeat0, state.mapRepeat1);
	}

	bindMix(locations, material, state) {
		const texture = state.mixReady
			? this.textureFor(state.mixImage, material)
			: this.defaultTexture;
		this.bindOne(2, locations.mixMap, texture);
		this.gl.uniform1i(locations.useMixMap, state.mixReady ? 1 : 0);
		this.gl.uniform2f(locations.mixRepeat, state.mixRepeat0, state.mixRepeat1);
		this.gl.uniform1f(locations.mixStrength, state.mixStrength);
		if (locations.mixPatchScale) this.gl.uniform1f(locations.mixPatchScale, state.patchScale);
		if (locations.mixPatchSharpness) {
			this.gl.uniform1f(locations.mixPatchSharpness, state.patchSharpness);
		}
	}

	bindOne(unit, uniform, texture) {
		const gl = this.gl;
		if (this.activeUnit !== unit) {
			gl.activeTexture(gl.TEXTURE0 + unit);
			this.activeUnit = unit;
		}
		if (this.boundTextures.get(unit) !== texture) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			this.boundTextures.set(unit, texture);
		}
		if (uniform) gl.uniform1i(uniform, unit);
	}

	textureFor(source, material) {
		if (this.cache.has(source)) return this.cache.get(source);
		const gl = this.gl;
		const texture = gl.createTexture();
		const powerOfTwo = isPowerOfTwo(sourceWidth(source))
			&& isPowerOfTwo(sourceHeight(source));
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
		this.cache.set(source, texture);
		return texture;
	}

	applyAnisotropy(material) {
		if (!this.aniso || material?.anisotropy === false) return;
		const maximum = this.gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
		const requested = material?.anisotropy === true ? 4 : Number(material?.anisotropy || 2);
		this.gl.texParameterf(
			this.gl.TEXTURE_2D,
			this.aniso.TEXTURE_MAX_ANISOTROPY_EXT,
			Math.min(requested, maximum)
		);
	}
}
