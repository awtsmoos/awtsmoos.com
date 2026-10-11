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
				this.record('readPixels', { x, y, width, height, format, type, bytes: pixels?.byteLength ?? pixels?.length ?? 0 });
				// B"H 2026-10-09 (readback): REAL readPixels. The software pipeline
				// keeps the drawing buffer in RAM (Uint8ClampedArray, top-row-first),
				// so readback is row memcpys with a Y-flip — no GPU round-trip.
				// Chrome pays a pipeline flush + PCIe read here; we pay memcpy.
				const RGBA = this.RGBA, UNSIGNED_BYTE = this.UNSIGNED_BYTE;
				if (format !== RGBA || type !== UNSIGNED_BYTE) {
					// Per spec only RGBA/UNSIGNED_BYTE is required for the default framebuffer.
					return this.invalid(this.INVALID_OPERATION, 'readPixels');
				}
				const fb = boundFramebuffer(this, this.FRAMEBUFFER);
				if (fb) {
					// User FBOs don't have software pixel storage yet; keep zero-fill.
					if (pixels && typeof pixels.fill === 'function') pixels.fill(0);
					return;
				}
				let db = this.drawingBuffer;
				if (!db) {
					// Lazily create a zeroed buffer (matches initial GL state).
					const w = Math.max(1, Math.floor(this.canvas?.width || 300));
					const h = Math.max(1, Math.floor(this.canvas?.height || 150));
					db = this.drawingBuffer = { w, h, color: new Uint8ClampedArray(w * h * 4), depth: new Float32Array(w * h).fill(1) };
				}
				const bw = db.w, bh = db.h, src = db.color;
				const ix = Math.floor(x), iy = Math.floor(y), iw = Math.floor(width), ih = Math.floor(height);
				const x0 = Math.max(0, ix), y0 = Math.max(0, iy);
				const x1 = Math.min(bw, ix + iw), y1 = Math.min(bh, iy + ih);
				const cw = x1 - x0, ch = y1 - y0;
				if (!pixels || cw <= 0 || ch <= 0) return;
				// Destination rows are bottom-up (GL convention); source buffer is top-row-first.
				const rowBytes = cw * 4;
				for (let r = 0; r < ch; r++) {
					const grow = y0 + r;
					const srow = bh - 1 - grow;
					const si = (srow * bw + x0) * 4;
					const di = (r * iw + (x0 - ix)) * 4;
					if (typeof pixels.set === 'function') {
						pixels.set(src.subarray(si, si + rowBytes), di);
					} else {
						for (let i = 0; i < rowBytes; i++) pixels[di + i] = src[si + i];
					}
				}
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
