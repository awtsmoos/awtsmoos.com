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
	 * Core WebGL 1 constants used by validation, state queries, and command logs.
	 * Keeping numbers in one immutable table prevents subtle divergence between
	 * browser execution, bytecode compilation, and future native GPU backends.
	 */
	const CORE_WEBGL_CONSTANTS = Object.freeze({
		FALSE: 0,
		TRUE: 1,
		NO_ERROR: 0,
		INVALID_ENUM: 0x0500,
		INVALID_VALUE: 0x0501,
		INVALID_OPERATION: 0x0502,
		OUT_OF_MEMORY: 0x0505,
		INVALID_FRAMEBUFFER_OPERATION: 0x0506,
		CONTEXT_LOST_WEBGL: 0x9242,
		COLOR_BUFFER_BIT: 0x4000,
		DEPTH_BUFFER_BIT: 0x0100,
		STENCIL_BUFFER_BIT: 0x0400,
		ARRAY_BUFFER: 0x8892,
		ELEMENT_ARRAY_BUFFER: 0x8893,
		STREAM_DRAW: 0x88e0,
		STATIC_DRAW: 0x88e4,
		DYNAMIC_DRAW: 0x88e8,
		BYTE: 0x1400,
		UNSIGNED_BYTE: 0x1401,
		SHORT: 0x1402,
		UNSIGNED_SHORT: 0x1403,
		INT: 0x1404,
		UNSIGNED_INT: 0x1405,
		FLOAT: 0x1406,
		POINTS: 0x0000,
		LINES: 0x0001,
		LINE_LOOP: 0x0002,
		LINE_STRIP: 0x0003,
		TRIANGLES: 0x0004,
		TRIANGLE_STRIP: 0x0005,
		TRIANGLE_FAN: 0x0006,
		VERTEX_SHADER: 0x8b31,
		FRAGMENT_SHADER: 0x8b30,
		DELETE_STATUS: 0x8b80,
		COMPILE_STATUS: 0x8b81,
		LINK_STATUS: 0x8b82,
		VALIDATE_STATUS: 0x8b83,
		ATTACHED_SHADERS: 0x8b85,
		ACTIVE_UNIFORMS: 0x8b86,
		ACTIVE_ATTRIBUTES: 0x8b89,
		SHADER_TYPE: 0x8b4f,
		LOW_FLOAT: 0x8df0,
		MEDIUM_FLOAT: 0x8df1,
		HIGH_FLOAT: 0x8df2,
		LOW_INT: 0x8df3,
		MEDIUM_INT: 0x8df4,
		HIGH_INT: 0x8df5,
		DEPTH_TEST: 0x0b71,
		BLEND: 0x0be2,
		CULL_FACE: 0x0b44,
		SRC_ALPHA: 0x0302,
		ONE_MINUS_SRC_ALPHA: 0x0303,
		LEQUAL: 0x0203,
		BACK: 0x0405,
		CCW: 0x0901,
		FRAMEBUFFER: 0x8d40,
		RENDERBUFFER: 0x8d41,
		COLOR_ATTACHMENT0: 0x8ce0,
		DEPTH_ATTACHMENT: 0x8d00,
		STENCIL_ATTACHMENT: 0x8d20,
		FRAMEBUFFER_COMPLETE: 0x8cd5,
		FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 0x8cd6,
		FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 0x8cd7,
		VERSION: 0x1f02,
		SHADING_LANGUAGE_VERSION: 0x8b8c,
		VENDOR: 0x1f00,
		RENDERER: 0x1f01,
		MAX_VERTEX_ATTRIBS: 0x8869,
		DEPTH_BITS: 0x0d56,
		STENCIL_BITS: 0x0d57,
		CURRENT_PROGRAM: 0x8b8d,
		ARRAY_BUFFER_BINDING: 0x8894,
		ELEMENT_ARRAY_BUFFER_BINDING: 0x8895,
		ACTIVE_TEXTURE: 0x84e0,
		TEXTURE_BINDING_2D: 0x8069,
		FRAMEBUFFER_BINDING: 0x8ca6,
		RENDERBUFFER_BINDING: 0x8ca7,
		VIEWPORT: 0x0ba2,
		SCISSOR_BOX: 0x0c10,
		COLOR_CLEAR_VALUE: 0x0c22,
		COLOR_WRITEMASK: 0x0c23,
		DEPTH_WRITEMASK: 0x0b72,
		DEPTH_FUNC: 0x0b74
	});

	/**
	 * Installs core constants as own numeric properties on one context.
	 * @param {object} gl Virtual WebGL context.
	 * @returns {object} The same context for fluent construction.
	 */
	function installCoreWebGLConstants(gl) {
		Object.assign(gl, CORE_WEBGL_CONSTANTS);
		return gl;
	}

	return {
		CORE_WEBGL_CONSTANTS,
		installCoreWebGLConstants
	};
});
