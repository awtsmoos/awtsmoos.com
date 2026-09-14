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
	 * Installs mutable raster, blend, depth, stencil, viewport, clear, and draw
	 * state. Every setter updates retained state before journaling the operation,
	 * enabling getParameter and native render backends to observe the same truth.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLStateApi(Context) {
		Object.assign(Context.prototype, {
			clearColor(r, g, b, a) {
				this.clearColorValue = [clamp01(r), clamp01(g), clamp01(b), clamp01(a)];
				this.record('clearColor', { value: this.clearColorValue });
			},
			colorMask(red, green, blue, alpha) {
				this.colorMaskValue = [!!red, !!green, !!blue, !!alpha];
				this.record('colorMask', { value: this.colorMaskValue });
			},
			clearDepth(value) {
				this.clearDepthValue = clamp01(value);
				this.record('clearDepth', { value: this.clearDepthValue });
			},
			clearStencil(value) {
				this.clearStencilValue = Number(value) | 0;
				this.record('clearStencil', { value: this.clearStencilValue });
			},
			clear(mask) {
				this.record('clear', { mask });
			},
			viewport(x, y, width, height) {
				if (width < 0 || height < 0) return this.invalid(this.INVALID_VALUE, 'viewport');
				this.viewportValue = [x, y, width, height];
				this.record('viewport', { value: this.viewportValue });
			},
			scissor(x, y, width, height) {
				if (width < 0 || height < 0) return this.invalid(this.INVALID_VALUE, 'scissor');
				this.scissorValue = [x, y, width, height];
				this.record('scissor', { value: this.scissorValue });
			},
			enable(cap) {
				this.enabledCaps.add(cap);
				this.record('enable', { cap });
			},
			disable(cap) {
				this.enabledCaps.delete(cap);
				this.record('disable', { cap });
			},
			isEnabled(cap) {
				return this.enabledCaps.has(cap);
			},
			depthFunc(func) {
				this.depthFuncValue = func;
				this.record('depthFunc', { func });
			},
			depthMask(flag) {
				this.depthMaskValue = !!flag;
				this.record('depthMask', { flag: this.depthMaskValue });
			},
			blendFunc(sfactor, dfactor) {
				this.blendFuncValue = [sfactor, dfactor];
				this.record('blendFunc', { sfactor, dfactor });
			},
			blendEquation(mode) {
				this.blendEquationValue = mode;
				this.record('blendEquation', { mode });
			},
			cullFace(mode) {
				this.cullFaceValue = mode;
				this.record('cullFace', { mode });
			},
			frontFace(mode) {
				this.frontFaceValue = mode;
				this.record('frontFace', { mode });
			},
			stencilMask(mask) {
				this.stencilMaskValue = mask;
				this.record('stencilMask', { mask });
			},
			stencilFunc(func, ref, mask) {
				this.record('stencilFunc', { func, ref, mask });
			},
			stencilOp(fail, zfail, zpass) {
				this.record('stencilOp', { fail, zfail, zpass });
			},
			drawArrays(mode, first, count) {
				if (count < 0 || first < 0) return this.invalid(this.INVALID_VALUE, 'drawArrays');
				if (!this.currentProgram) this.pushError(this.INVALID_OPERATION);
				this.record('drawArrays', { mode, first, count, program: this.currentProgram?.id ?? null });
			},
			drawElements(mode, count, type, offset) {
				if (count < 0 || offset < 0) return this.invalid(this.INVALID_VALUE, 'drawElements');
				if (!this.currentProgram) this.pushError(this.INVALID_OPERATION);
				this.record('drawElements', { mode, count, type, offset, program: this.currentProgram?.id ?? null });
			}
		});
	}

	/** @returns {number} */
	function clamp01(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}

	return { installWebGLStateApi };
});
