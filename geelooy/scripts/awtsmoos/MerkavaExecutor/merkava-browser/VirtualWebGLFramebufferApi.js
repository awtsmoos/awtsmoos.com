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
	 * Installs framebuffer/renderbuffer lifecycle and completeness semantics.
	 * User framebuffers now distinguish missing attachments from complete state,
	 * while the default framebuffer remains complete by definition.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLFramebufferApi(Context) {
		Object.assign(Context.prototype, {
			createFramebuffer() {
				const framebuffer = this.object('framebuffer', { deleted: false, attachments: new Map() });
				this.record('createFramebuffer', { id: framebuffer.id });
				return framebuffer;
			},
			bindFramebuffer(target, framebuffer) {
				if (!framebufferTarget(this, target)) return this.invalid(this.INVALID_ENUM, 'bindFramebuffer', { target });
				if (framebuffer && !this.validObject(framebuffer, 'framebuffer')) return this.invalid(this.INVALID_OPERATION, 'bindFramebuffer');
				this.boundFramebuffers.set(target, framebuffer || null);
				if (target === this.FRAMEBUFFER) this.boundFramebuffer = framebuffer || null;
				this.record('bindFramebuffer', { target, id: framebuffer?.id ?? null });
			},
			framebufferTexture2D(target, attachment, textarget, texture, level) {
				const framebuffer = boundFramebuffer(this, target);
				if (!framebuffer) return this.invalid(this.INVALID_OPERATION, 'framebufferTexture2D');
				if (texture && !this.validObject(texture, 'texture')) return this.invalid(this.INVALID_OPERATION, 'framebufferTexture2D');
				framebuffer.attachments.set(attachment, texture ? { kind: 'texture', object: texture, level, textarget } : null);
				this.record('framebufferTexture2D', { target, attachment, textarget, texture: texture?.id ?? null, level });
			},
			checkFramebufferStatus(target = this.FRAMEBUFFER) {
				const framebuffer = boundFramebuffer(this, target);
				if (!framebuffer) return this.FRAMEBUFFER_COMPLETE;
				const attached = [...framebuffer.attachments.values()].filter(Boolean);
				return attached.length ? this.FRAMEBUFFER_COMPLETE : this.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT;
			},
			deleteFramebuffer(framebuffer) {
				if (this.validObject(framebuffer, 'framebuffer')) framebuffer.deleted = true;
				this.record('deleteFramebuffer', { id: framebuffer?.id ?? null });
			},
			isFramebuffer(framebuffer) {
				return this.validObject(framebuffer, 'framebuffer');
			},
			createRenderbuffer() {
				const renderbuffer = this.object('renderbuffer', { deleted: false, width: 0, height: 0, internalFormat: 0 });
				this.record('createRenderbuffer', { id: renderbuffer.id });
				return renderbuffer;
			},
			bindRenderbuffer(target, renderbuffer) {
				if (target !== this.RENDERBUFFER) return this.invalid(this.INVALID_ENUM, 'bindRenderbuffer', { target });
				if (renderbuffer && !this.validObject(renderbuffer, 'renderbuffer')) return this.invalid(this.INVALID_OPERATION, 'bindRenderbuffer');
				this.boundRenderbuffer = renderbuffer || null;
				this.record('bindRenderbuffer', { target, id: renderbuffer?.id ?? null });
			},
			renderbufferStorage(target, internalFormat, width, height) {
				if (target !== this.RENDERBUFFER) return this.invalid(this.INVALID_ENUM, 'renderbufferStorage', { target });
				if (!this.boundRenderbuffer) return this.invalid(this.INVALID_OPERATION, 'renderbufferStorage');
				if (width < 0 || height < 0) return this.invalid(this.INVALID_VALUE, 'renderbufferStorage');
				Object.assign(this.boundRenderbuffer, { internalFormat, width, height });
				this.record('renderbufferStorage', { target, internalFormat, width, height });
			},
			framebufferRenderbuffer(target, attachment, renderbufferTarget, renderbuffer) {
				const framebuffer = boundFramebuffer(this, target);
				if (!framebuffer || renderbufferTarget !== this.RENDERBUFFER) return this.invalid(this.INVALID_OPERATION, 'framebufferRenderbuffer');
				framebuffer.attachments.set(attachment, renderbuffer ? { kind: 'renderbuffer', object: renderbuffer } : null);
				this.record('framebufferRenderbuffer', { target, attachment, renderbuffer: renderbuffer?.id ?? null });
			},
			deleteRenderbuffer(renderbuffer) {
				if (this.validObject(renderbuffer, 'renderbuffer')) renderbuffer.deleted = true;
				this.record('deleteRenderbuffer', { id: renderbuffer?.id ?? null });
			},
			isRenderbuffer(renderbuffer) {
				return this.validObject(renderbuffer, 'renderbuffer');
			},
			readPixels(x, y, width, height, format, type, pixels) {
				if (width < 0 || height < 0) return this.invalid(this.INVALID_VALUE, 'readPixels');
				if (pixels && typeof pixels.fill === 'function') pixels.fill(0);
				this.record('readPixels', { x, y, width, height, format, type, bytes: pixels?.byteLength ?? pixels?.length ?? 0 });
			}
		});
	}

	/** @returns {boolean} */
	function framebufferTarget(gl, target) {
		return [gl.FRAMEBUFFER, gl.READ_FRAMEBUFFER, gl.DRAW_FRAMEBUFFER].includes(target);
	}
	/** @returns {object|null} */
	function boundFramebuffer(gl, target) {
		if (target === gl.FRAMEBUFFER) return gl.boundFramebuffer;
		return gl.boundFramebuffers.get(target) || null;
	}

	return { installWebGLFramebufferApi };
});
