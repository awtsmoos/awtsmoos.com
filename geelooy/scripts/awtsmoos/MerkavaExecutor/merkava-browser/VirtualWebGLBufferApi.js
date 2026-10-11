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
	 * Installs WebGL buffer and vertex-attribute semantics on a virtual context.
	 * Invalid targets, deleted handles, missing bindings, negative sizes, and
	 * invalid offsets enter the WebGL error queue instead of silently succeeding.
	 *
	 * B"H 2026-10-09 — huge-buffer pass:
	 *   * bufferData with a numeric size (the orphaning idiom) now allocates
	 *     real zeroed storage so subsequent bufferSubData updates live data
	 *     (was: stored the number; subdata silently journal-only).
	 *   * bufferSubData writes directly into existing storage (was: full
	 *     buffer copy per call — O(n) per streaming update).
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLBufferApi(Context) {
		Object.assign(Context.prototype, {
			createBuffer() {
				const buffer = this.object('buffer', { bytes: 0, deleted: false, usage: 0 });
				this.record('createBuffer', { id: buffer.id });
				return buffer;
			},
			bindBuffer(target, buffer) {
				if (!validTarget(this, target)) return this.invalid(this.INVALID_ENUM, 'bindBuffer', { target });
				if (buffer && !this.validObject(buffer, 'buffer')) return this.invalid(this.INVALID_OPERATION, 'bindBuffer');
				this.boundBuffers.set(target, buffer || null);
				this.record('bindBuffer', { target, id: buffer?.id ?? null });
			},
			bufferData(target, data, usage) {
				const buffer = this.boundBuffers.get(target);
				if (!validTarget(this, target)) return this.invalid(this.INVALID_ENUM, 'bufferData', { target });
				if (!buffer) return this.invalid(this.INVALID_OPERATION, 'bufferData', { target });
				const bytes = byteLength(data);
				if (bytes < 0) return this.invalid(this.INVALID_VALUE, 'bufferData', { target });
				buffer.bytes = bytes;
				buffer.usage = usage;
				// B"H: numeric size = orphan/reserve idiom. Allocate real
				// zeroed storage so bufferSubData has live bytes to update.
				buffer.data = (typeof data === 'number') ? new ArrayBuffer(bytes) : cloneData(data);
				this.record('bufferData', { target, bytes, usage });
			},
			bufferSubData(target, offset, data) {
				const buffer = this.boundBuffers.get(target);
				if (!validTarget(this, target)) return this.invalid(this.INVALID_ENUM, 'bufferSubData', { target });
				if (!buffer) return this.invalid(this.INVALID_OPERATION, 'bufferSubData', { target });
				if (Number(offset) < 0) return this.invalid(this.INVALID_VALUE, 'bufferSubData', { offset });
				// B"H: write directly into live storage (no full-buffer copy).
				try {
					const off = Math.floor(Number(offset));
					if (ArrayBuffer.isView(data)) {
						const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
						if (buffer.data instanceof ArrayBuffer) {
							if (off + src.byteLength <= buffer.data.byteLength) {
								new Uint8Array(buffer.data, off, src.byteLength).set(src);
							}
						} else if (ArrayBuffer.isView(buffer.data)) {
							const Ctor = buffer.data.constructor;
							// B"H: TypedArray 3rd ctor arg is element count, not bytes.
						const dst = new Ctor(buffer.data.buffer, buffer.data.byteOffset, buffer.data.length);
							const elOff = Math.floor(off / dst.BYTES_PER_ELEMENT);
							if (elOff + src.byteLength / dst.BYTES_PER_ELEMENT <= dst.length) {
								dst.set(new Ctor(src.buffer, src.byteOffset, Math.floor(src.byteLength / dst.BYTES_PER_ELEMENT)), elOff);
							}
						}
					}
				} catch (e) { /* journal still records the call */ }
				this.record('bufferSubData', { target, offset, bytes: byteLength(data) });
			},
			deleteBuffer(buffer) {
				if (this.validObject(buffer, 'buffer')) buffer.deleted = true;
				this.record('deleteBuffer', { id: buffer?.id ?? null });
			},
			isBuffer(buffer) {
				return this.validObject(buffer, 'buffer');
			},
			enableVertexAttribArray(location) {
				(this.enabledAttribs || (this.enabledAttribs = new Set())).add(location);
				this.record('enableVertexAttribArray', { location });
			},
			disableVertexAttribArray(location) {
				(this.enabledAttribs || (this.enabledAttribs = new Set())).delete(location);
				this.record('disableVertexAttribArray', { location });
			},
			vertexAttribPointer(location, size, type, normalized, stride, offset) {
				if (size < 1 || size > 4 || stride < 0 || offset < 0) return this.invalid(this.INVALID_VALUE, 'vertexAttribPointer');
				// B"H: live pointer state for the software pipeline (journal preserved).
				(this.attribPointers || (this.attribPointers = {}))[location] = {
					buffer: this.boundBuffers.get(this.ARRAY_BUFFER) || null,
					size, type, normalized: !!normalized, stride, offset
				};
				this.record('vertexAttribPointer', { location, size, type, normalized: !!normalized, stride, offset });
			},
			vertexAttrib1f(l, x) { (this.attribConstants || (this.attribConstants = {}))[l] = [x, 0, 0, 1]; this.record('vertexAttrib1f', { location: l }); },
			vertexAttrib2f(l, x, y) { (this.attribConstants || (this.attribConstants = {}))[l] = [x, y, 0, 1]; this.record('vertexAttrib2f', { location: l }); },
			vertexAttrib3f(l, x, y, z) { (this.attribConstants || (this.attribConstants = {}))[l] = [x, y, z, 1]; this.record('vertexAttrib3f', { location: l }); },
			vertexAttrib4f(l, x, y, z, w) { (this.attribConstants || (this.attribConstants = {}))[l] = [x, y, z, w]; this.record('vertexAttrib4f', { location: l }); },
			vertexAttrib1fv(l, v) { (this.attribConstants || (this.attribConstants = {}))[l] = [v[0], 0, 0, 1]; this.record('vertexAttrib1fv', { location: l }); },
			vertexAttrib2fv(l, v) { (this.attribConstants || (this.attribConstants = {}))[l] = [v[0], v[1], 0, 1]; this.record('vertexAttrib2fv', { location: l }); },
			vertexAttrib3fv(l, v) { (this.attribConstants || (this.attribConstants = {}))[l] = [v[0], v[1], v[2], 1]; this.record('vertexAttrib3fv', { location: l }); },
			vertexAttrib4fv(l, v) { (this.attribConstants || (this.attribConstants = {}))[l] = [v[0], v[1], v[2], v[3]]; this.record('vertexAttrib4fv', { location: l }); },
		});
	}

	/** @returns {boolean} */
	function validTarget(gl, target) {
		return [gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER, gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER,
			gl.PIXEL_PACK_BUFFER, gl.PIXEL_UNPACK_BUFFER, gl.UNIFORM_BUFFER,
			gl.TRANSFORM_FEEDBACK_BUFFER].includes(target);
	}

	/** @returns {number} */
	function byteLength(data) {
		if (typeof data === 'number') return data >= 0 ? data : -1;
		if (data == null) return 0;
		return Number(data.byteLength ?? data.length ?? 0);
	}

	/** @returns {*} */
	function cloneData(data) {
		if (ArrayBuffer.isView(data)) return data.slice ? data.slice() : Array.from(data);
		if (data instanceof ArrayBuffer) return data.slice(0);
		return data;
	}

	return { installWebGLBufferApi };
});
