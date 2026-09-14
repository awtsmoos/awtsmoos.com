//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== 'undefined' ? self : this, function() {
	/**
	 * Texture, format, and implementation-limit constants shared by WebGL 1/2.
	 */
	const TEXTURE_WEBGL_CONSTANTS = Object.freeze({
		TEXTURE_2D: 0x0de1,
		TEXTURE_CUBE_MAP: 0x8513,
		TEXTURE0: 0x84c0,
		RGBA: 0x1908,
		RGB: 0x1907,
		LINEAR: 0x2601,
		NEAREST: 0x2600,
		LINEAR_MIPMAP_LINEAR: 0x2703,
		NEAREST_MIPMAP_NEAREST: 0x2700,
		CLAMP_TO_EDGE: 0x812f,
		REPEAT: 0x2901,
		MIRRORED_REPEAT: 0x8370,
		TEXTURE_MIN_FILTER: 0x2801,
		TEXTURE_MAG_FILTER: 0x2800,
		TEXTURE_WRAP_S: 0x2802,
		TEXTURE_WRAP_T: 0x2803,
		UNPACK_ALIGNMENT: 0x0cf5,
		PACK_ALIGNMENT: 0x0d05,
		UNPACK_FLIP_Y_WEBGL: 0x9240,
		UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
		MAX_TEXTURE_SIZE: 0x0d33,
		MAX_CUBE_MAP_TEXTURE_SIZE: 0x851c,
		MAX_RENDERBUFFER_SIZE: 0x84e8,
		MAX_VERTEX_UNIFORM_VECTORS: 0x8dfb,
		MAX_FRAGMENT_UNIFORM_VECTORS: 0x8dfd,
		MAX_TEXTURE_IMAGE_UNITS: 0x8872,
		MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8b4c,
		MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8b4d,
		ALIASED_LINE_WIDTH_RANGE: 0x846e,
		ALIASED_POINT_SIZE_RANGE: 0x846d
	});

	/**
	 * Installs texture and implementation-limit constants on one context.
	 * @param {object} gl Virtual WebGL context.
	 * @returns {object} The same context.
	 */
	function installTextureWebGLConstants(gl) {
		Object.assign(gl, TEXTURE_WEBGL_CONSTANTS);
		for (let unit = 1; unit < 32; unit += 1) {
			gl[`TEXTURE${unit}`] = gl.TEXTURE0 + unit;
		}
		for (let attachment = 1; attachment < 16; attachment += 1) {
			gl[`COLOR_ATTACHMENT${attachment}`] = 0x8ce0 + attachment;
		}
		return gl;
	}

	return {
		TEXTURE_WEBGL_CONSTANTS,
		installTextureWebGLConstants
	};
});
