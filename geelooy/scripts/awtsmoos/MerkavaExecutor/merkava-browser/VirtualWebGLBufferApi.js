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
				buffer.data = cloneData(data);
				this.record('bufferData', { target, bytes, usage });
			},
			bufferSubData(target, offset, data) {
				const buffer = this.boundBuffers.get(target);
				if (!validTarget(this, target)) return this.invalid(this.INVALID_ENUM, 'bufferSubData', { target });
				if (!buffer) return this.invalid(this.INVALID_OPERATION, 'bufferSubData', { target });
				if (Number(offset) < 0) return this.invalid(this.INVALID_VALUE, 'bufferSubData', { offset });
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
				this.record('enableVertexAttribArray', { location });
			},
			disableVertexAttribArray(location) {
				this.record('disableVertexAttribArray', { location });
			},
			vertexAttribPointer(location, size, type, normalized, stride, offset) {
				if (size < 1 || size > 4 || stride < 0 || offset < 0) return this.invalid(this.INVALID_VALUE, 'vertexAttribPointer');
				this.record('vertexAttribPointer', { location, size, type, normalized: !!normalized, stride, offset });
			}
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
