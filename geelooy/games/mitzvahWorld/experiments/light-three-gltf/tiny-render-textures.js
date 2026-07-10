// B"H
import {
	addMapStats,
	addMixStats
} from './tiny-render-texture-stats.js';
import {
	createDefaultTexture,
	isPowerOfTwo,
	setTextureParameters,
	sourceHeight,
	sourceReady,
	sourceWidth
} from './tiny-texture-source.js';

/** Binds base and mix textures while preserving one exact repeat vector. */
export class MaterialTextureBinder {
	constructor(gl) {
		this.gl = gl;
		this.cache = new WeakMap();
		this.defaultTexture = createDefaultTexture(gl);
		this.aniso = gl.getExtension('EXT_texture_filter_anisotropic')
			|| gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
	}

	bind(locations, material, stats) {
		const gl = this.gl;
		const mapReady = sourceReady(material?.mapImage);
		const mixReady = sourceReady(material?.mixImage);
		bindOne(
			gl,
			1,
			locations.map,
			mapReady ? this.textureFor(material.mapImage, material) : this.defaultTexture
		);
		gl.uniform1i(locations.useMap, mapReady ? 1 : 0);
		gl.uniform2f(locations.mapRepeat, ...(material?.mapRepeat || [1, 1]));
		bindOne(
			gl,
			2,
			locations.mixMap,
			mixReady ? this.textureFor(material.mixImage, material) : this.defaultTexture
		);
		gl.uniform1i(locations.useMixMap, mixReady ? 1 : 0);
		gl.uniform2f(locations.mixRepeat, ...(material?.mixRepeat || [1, 1]));
		gl.uniform1f(locations.mixStrength, material?.mixStrength ?? 0);
		if (locations.mixPatchScale) {
			gl.uniform1f(locations.mixPatchScale, material?.mixPatchScale ?? 0);
		}
		if (locations.mixPatchSharpness) {
			gl.uniform1f(locations.mixPatchSharpness, material?.mixPatchSharpness ?? 0.58);
		}
		if (mapReady) addMapStats(material, stats);
		if (mixReady) addMixStats(material, stats);
	}

	textureFor(source, material) {
		if (this.cache.has(source)) return this.cache.get(source);
		const gl = this.gl;
		const texture = gl.createTexture();
		const powerOfTwo = isPowerOfTwo(sourceWidth(source))
			&& isPowerOfTwo(sourceHeight(source));
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		if (powerOfTwo) {
			gl.generateMipmap(gl.TEXTURE_2D);
			setTextureParameters(gl, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT);
		} else {
			setTextureParameters(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE);
		}
		this.applyAnisotropy(material);
		this.cache.set(source, texture);
		return texture;
	}

	applyAnisotropy(material) {
		if (!this.aniso || material?.anisotropy === false) return;
		const gl = this.gl;
		const maximum = gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
		const requested = material?.anisotropy === true
			? 4
			: Number(material?.anisotropy || 2);
		gl.texParameterf(
			gl.TEXTURE_2D,
			this.aniso.TEXTURE_MAX_ANISOTROPY_EXT,
			Math.min(requested, maximum)
		);
	}
}

function bindOne(gl, unit, uniform, texture) {
	gl.activeTexture(gl.TEXTURE0 + unit);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	if (uniform) gl.uniform1i(uniform, unit);
}
