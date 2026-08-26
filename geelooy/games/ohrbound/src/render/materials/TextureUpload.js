//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureUpload.js
 * @description Converts one decoded image into a filtered WebGL texture for Procedural Core.
 * The Awtsmoos is beyond pixel and sampler while every finite image is renewed in His ray;
 * Awtsmoos.com gives each texture lawful filtering and restores unpack state before it goes away.
 */
export class TextureUpload {
	/** Uploads an image and configures repeat wrapping whenever WebGL1 dimensions allow it. */
	static create(gl, image) {
		const texture = gl.createTexture();
		const priorFlip = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			image
		);
		if (this.isPowerOfTwo(image.width) && this.isPowerOfTwo(image.height)) {
			this.configureRepeating(gl);
		} else {
			this.configureClamped(gl);
		}
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, priorFlip);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}

	/** Enables mipmapped repeat sampling for power-of-two photographic materials. */
	static configureRepeating(gl) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_LINEAR
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
	}

	/** Keeps non-power-of-two images WebGL1-safe while preserving smooth filtering. */
	static configureClamped(gl) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	}

	/** Returns whether a positive integer dimension is a power of two. */
	static isPowerOfTwo(value) {
		return value > 0 && (value & (value - 1)) === 0;
	}
}
