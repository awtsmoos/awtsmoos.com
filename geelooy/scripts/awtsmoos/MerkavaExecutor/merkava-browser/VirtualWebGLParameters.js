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
	 * Installs state-aware WebGL parameter and precision queries. Values reflect
	 * retained virtual state instead of returning a universal zero, making state
	 * transitions observable to application code and future conformance tests.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLParameters(Context) {
		Context.prototype.getParameter = function(param) {
			const dynamic = dynamicParameter(this, param);
			if (dynamic.found) return dynamic.value;
			const fixed = fixedParameters(this);
			if (fixed.has(param)) return fixed.get(param);
			this.pushError(this.INVALID_ENUM);
			return null;
		};
		Context.prototype.getShaderPrecisionFormat = function(shaderType, precisionType) {
			if (![this.VERTEX_SHADER, this.FRAGMENT_SHADER].includes(shaderType)) {
				this.pushError(this.INVALID_ENUM);
				return null;
			}
			const low = [this.LOW_FLOAT, this.LOW_INT].includes(precisionType);
			return {
				precision: low ? 8 : 23,
				rangeMax: low ? 127 : 127,
				rangeMin: low ? 127 : 127
			};
		};
	}

	/** @returns {{found:boolean,value:*}} */
	function dynamicParameter(gl, param) {
		const rows = new Map([
			[gl.CURRENT_PROGRAM, gl.currentProgram],
			[gl.ARRAY_BUFFER_BINDING, gl.boundBuffers.get(gl.ARRAY_BUFFER) || null],
			[gl.ELEMENT_ARRAY_BUFFER_BINDING, gl.boundBuffers.get(gl.ELEMENT_ARRAY_BUFFER) || null],
			[gl.ACTIVE_TEXTURE, gl.activeTextureValue],
			[gl.TEXTURE_BINDING_2D, gl.boundTextures.get(`${gl.activeTextureUnit}:${gl.TEXTURE_2D}`) || null],
			[gl.FRAMEBUFFER_BINDING, gl.boundFramebuffer || null],
			[gl.RENDERBUFFER_BINDING, gl.boundRenderbuffer || null],
			[gl.VIEWPORT, Int32Array.from(gl.viewportValue)],
			[gl.SCISSOR_BOX, Int32Array.from(gl.scissorValue)],
			[gl.COLOR_CLEAR_VALUE, Float32Array.from(gl.clearColorValue)],
			[gl.COLOR_WRITEMASK, gl.colorMaskValue.slice()],
			[gl.DEPTH_WRITEMASK, gl.depthMaskValue],
			[gl.DEPTH_FUNC, gl.depthFuncValue]
		]);
		return rows.has(param)
			? { found: true, value: rows.get(param) }
			: { found: false, value: null };
	}

	/** @returns {Map<number,*>} */
	function fixedParameters(gl) {
		return new Map([
			[gl.VERSION, gl.contextVersion >= 2 ? 'WebGL 2.0 Merkava' : 'WebGL 1.0 Merkava'],
			[gl.SHADING_LANGUAGE_VERSION, gl.contextVersion >= 2 ? 'WebGL GLSL ES 3.00 Merkava' : 'WebGL GLSL ES 1.00 Merkava'],
			[gl.VENDOR, 'Awtsmoos'],
			[gl.RENDERER, 'Merkava Virtual WebGL'],
			[gl.MAX_TEXTURE_SIZE, 4096],
			[gl.MAX_CUBE_MAP_TEXTURE_SIZE, 4096],
			[gl.MAX_RENDERBUFFER_SIZE, 4096],
			[gl.MAX_VERTEX_ATTRIBS, 16],
			[gl.MAX_VERTEX_UNIFORM_VECTORS, 1024],
			[gl.MAX_FRAGMENT_UNIFORM_VECTORS, 1024],
			[gl.MAX_TEXTURE_IMAGE_UNITS, 16],
			[gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS, 16],
			[gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 32],
			[gl.MAX_DRAW_BUFFERS, 16],
			[gl.MAX_COLOR_ATTACHMENTS, 16],
			[gl.MAX_3D_TEXTURE_SIZE, 2048],
			[gl.MAX_ARRAY_TEXTURE_LAYERS, 256],
			[gl.ALIASED_LINE_WIDTH_RANGE, Float32Array.from([1, 1])],
			[gl.ALIASED_POINT_SIZE_RANGE, Float32Array.from([1, 64])],
			[gl.DEPTH_BITS, 24],
			[gl.STENCIL_BITS, 8]
		]);
	}

	return { installWebGLParameters };
});
