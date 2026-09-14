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
	const SUPPORTED_EXTENSIONS = Object.freeze([
		'ANGLE_instanced_arrays',
		'EXT_color_buffer_float',
		'OES_standard_derivatives',
		'OES_texture_float',
		'OES_vertex_array_object',
		'WEBGL_debug_renderer_info',
		'WEBGL_depth_texture',
		'WEBGL_lose_context'
	]);

	/**
	 * Installs truthful extension discovery. Unsupported names return null;
	 * supported extension objects delegate into the same core state machine so
	 * extension and WebGL2 aliases cannot diverge in behavior.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLExtensions(Context) {
		Context.prototype.getSupportedExtensions = function() {
			return SUPPORTED_EXTENSIONS.slice();
		};
		Context.prototype.getExtension = function(name) {
			const canonical = SUPPORTED_EXTENSIONS.find(
				value => value.toLowerCase() === String(name || '').toLowerCase()
			);
			this.record('getExtension', { name: String(name || ''), supported: !!canonical });
			return canonical ? extensionObject(this, canonical) : null;
		};
	}

	/** @returns {object} */
	function extensionObject(gl, name) {
		if (name === 'OES_vertex_array_object') {
			return {
				VERTEX_ARRAY_BINDING_OES: gl.VERTEX_ARRAY_BINDING,
				bindVertexArrayOES: value => gl.bindVertexArray(value),
				createVertexArrayOES: () => gl.createVertexArray(),
				deleteVertexArrayOES: value => gl.deleteVertexArray(value),
				isVertexArrayOES: value => gl.isVertexArray(value)
			};
		}
		if (name === 'ANGLE_instanced_arrays') {
			return {
				VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: 0x88fe,
				drawArraysInstancedANGLE: (...args) => gl.drawArraysInstanced(...args),
				drawElementsInstancedANGLE: (...args) => gl.drawElementsInstanced(...args),
				vertexAttribDivisorANGLE: (...args) => gl.vertexAttribDivisor(...args)
			};
		}
		if (name === 'WEBGL_debug_renderer_info') {
			return {
				UNMASKED_RENDERER_WEBGL: 0x9246,
				UNMASKED_VENDOR_WEBGL: 0x9245
			};
		}
		if (name === 'WEBGL_lose_context') {
			return {
				loseContext: () => gl.loseContext(),
				restoreContext: () => gl.restoreContext()
			};
		}
		if (name === 'OES_standard_derivatives') {
			return { FRAGMENT_SHADER_DERIVATIVE_HINT_OES: 0x8b8b };
		}
		if (name === 'WEBGL_depth_texture') {
			return { UNSIGNED_INT_24_8_WEBGL: 0x84fa };
		}
		return Object.freeze({});
	}

	return {
		SUPPORTED_EXTENSIONS,
		installWebGLExtensions
	};
});
