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
	 * WebGL 2 constants required by native GLES3/Vulkan/Metal translation paths.
	 */
	const WEBGL2_CONSTANTS = Object.freeze({
		TEXTURE_3D: 0x806f,
		TEXTURE_2D_ARRAY: 0x8c1a,
		TEXTURE_WRAP_R: 0x8072,
		READ_FRAMEBUFFER: 0x8ca8,
		DRAW_FRAMEBUFFER: 0x8ca9,
		COPY_READ_BUFFER: 0x8f36,
		COPY_WRITE_BUFFER: 0x8f37,
		PIXEL_PACK_BUFFER: 0x88eb,
		PIXEL_UNPACK_BUFFER: 0x88ec,
		UNIFORM_BUFFER: 0x8a11,
		TRANSFORM_FEEDBACK_BUFFER: 0x8c8e,
		TRANSFORM_FEEDBACK: 0x8e22,
		RASTERIZER_DISCARD: 0x8c89,
		QUERY_RESULT: 0x8866,
		QUERY_RESULT_AVAILABLE: 0x8867,
		ANY_SAMPLES_PASSED: 0x8c2f,
		SYNC_GPU_COMMANDS_COMPLETE: 0x9117,
		ALREADY_SIGNALED: 0x911a,
		TIMEOUT_EXPIRED: 0x911b,
		CONDITION_SATISFIED: 0x911c,
		WAIT_FAILED: 0x911d,
		SYNC_STATUS: 0x9114,
		SIGNALED: 0x9119,
		UNSIGNALED: 0x9118,
		RGBA8: 0x8058,
		RGB8: 0x8051,
		DEPTH_COMPONENT24: 0x81a6,
		MAX_DRAW_BUFFERS: 0x8824,
		MAX_COLOR_ATTACHMENTS: 0x8cdf,
		MAX_3D_TEXTURE_SIZE: 0x8073,
		MAX_ARRAY_TEXTURE_LAYERS: 0x88ff,
		MAX_UNIFORM_BUFFER_BINDINGS: 0x8a2f,
		VERTEX_ARRAY_BINDING: 0x85b5
	});

	/**
	 * Installs WebGL 2 constants even when a WebGL 1 context is requested so the
	 * shared bytecode compiler can identify unsupported enums deterministically.
	 * @param {object} gl Virtual WebGL context.
	 * @returns {object} The same context.
	 */
	function installWebGL2Constants(gl) {
		Object.assign(gl, WEBGL2_CONSTANTS);
		return gl;
	}

	return {
		WEBGL2_CONSTANTS,
		installWebGL2Constants
	};
});
