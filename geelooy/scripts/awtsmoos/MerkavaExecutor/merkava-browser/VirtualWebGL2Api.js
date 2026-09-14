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
	 * Installs core WebGL2 object families and GPU command surfaces required by
	 * GLES3/Vulkan/Metal lowering: VAOs, queries, samplers, syncs, transform
	 * feedback, instancing, indexed buffer bindings, multisample, and blits.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGL2Api(Context) {
		Object.assign(Context.prototype, {
			createVertexArray() { return create(this, 'vertexArray', 'createVertexArray'); },
			bindVertexArray(value) { return bind(this, 'vertexArray', 'boundVertexArray', 'bindVertexArray', value); },
			deleteVertexArray(value) { return remove(this, 'vertexArray', 'deleteVertexArray', value); },
			isVertexArray(value) { return this.validObject(value, 'vertexArray'); },
			createQuery() { return create(this, 'query', 'createQuery', { active: false, available: false }); },
			beginQuery(target, query) {
				if (!this.validObject(query, 'query')) return this.invalid(this.INVALID_OPERATION, 'beginQuery');
				query.active = true;
				query.target = target;
				this.activeQueries.set(target, query);
				this.record('beginQuery', { target, id: query.id });
			},
			endQuery(target) {
				const query = this.activeQueries.get(target);
				if (!query) return this.invalid(this.INVALID_OPERATION, 'endQuery', { target });
				query.active = false;
				query.available = true;
				this.activeQueries.delete(target);
				this.record('endQuery', { target, id: query.id });
			},
			getQueryParameter(query, pname) {
				if (!this.validObject(query, 'query')) return null;
				if (pname === this.QUERY_RESULT_AVAILABLE) return !!query.available;
				if (pname === this.QUERY_RESULT) return query.result ?? 0;
				return null;
			},
			createSampler() { return create(this, 'sampler', 'createSampler', { parameters: new Map() }); },
			bindSampler(unit, sampler) {
				if (sampler && !this.validObject(sampler, 'sampler')) return this.invalid(this.INVALID_OPERATION, 'bindSampler');
				this.boundSamplers.set(unit, sampler || null);
				this.record('bindSampler', { unit, id: sampler?.id ?? null });
			},
			samplerParameteri(sampler, pname, param) { return samplerParameter(this, 'samplerParameteri', sampler, pname, param); },
			samplerParameterf(sampler, pname, param) { return samplerParameter(this, 'samplerParameterf', sampler, pname, param); },
			getSamplerParameter(sampler, pname) { return sampler?.parameters?.get(pname) ?? null; },
			fenceSync(condition, flags) {
				const sync = create(this, 'sync', 'fenceSync', { condition, flags, signaled: true });
				return sync;
			},
			clientWaitSync(sync) {
				if (!this.validObject(sync, 'sync')) return this.WAIT_FAILED;
				this.record('clientWaitSync', { id: sync.id });
				return sync.signaled ? this.ALREADY_SIGNALED : this.TIMEOUT_EXPIRED;
			},
			waitSync(sync, flags, timeout) { if (this.validObject(sync, 'sync')) this.record('waitSync', { id: sync.id, flags, timeout }); },
			deleteSync(sync) { return remove(this, 'sync', 'deleteSync', sync); },
			getSyncParameter(sync, pname) { return pname === this.SYNC_STATUS && sync?.signaled ? this.SIGNALED : this.UNSIGNALED; },
			createTransformFeedback() { return create(this, 'transformFeedback', 'createTransformFeedback', { active: false }); },
			bindTransformFeedback(target, value) { return bind(this, 'transformFeedback', 'boundTransformFeedback', 'bindTransformFeedback', value, { target }); },
			beginTransformFeedback(mode) { if (this.boundTransformFeedback) this.boundTransformFeedback.active = true; this.record('beginTransformFeedback', { mode }); },
			endTransformFeedback() { if (this.boundTransformFeedback) this.boundTransformFeedback.active = false; this.record('endTransformFeedback'); },
			bindBufferBase(target, index, buffer) { this.record('bindBufferBase', { target, index, buffer: buffer?.id ?? null }); },
			bindBufferRange(target, index, buffer, offset, size) { this.record('bindBufferRange', { target, index, buffer: buffer?.id ?? null, offset, size }); },
			drawArraysInstanced(mode, first, count, instanceCount) { this.record('drawArraysInstanced', { mode, first, count, instanceCount }); },
			drawElementsInstanced(mode, count, type, offset, instanceCount) { this.record('drawElementsInstanced', { mode, count, type, offset, instanceCount }); },
			vertexAttribDivisor(index, divisor) { this.record('vertexAttribDivisor', { index, divisor }); },
			drawBuffers(buffers) { this.drawBuffersValue = Array.from(buffers || []); this.record('drawBuffers', { buffers: this.drawBuffersValue }); },
			readBuffer(buffer) { this.readBufferValue = buffer; this.record('readBuffer', { buffer }); },
			blitFramebuffer(...args) { this.record('blitFramebuffer', { args: args.slice() }); },
			renderbufferStorageMultisample(target, samples, internalFormat, width, height) { this.record('renderbufferStorageMultisample', { target, samples, internalFormat, width, height }); },
			invalidateFramebuffer(target, attachments) { this.record('invalidateFramebuffer', { target, attachments: Array.from(attachments || []) }); },
			texStorage2D(target, levels, internalFormat, width, height) { this.record('texStorage2D', { target, levels, internalFormat, width, height }); },
			texStorage3D(target, levels, internalFormat, width, height, depth) { this.record('texStorage3D', { target, levels, internalFormat, width, height, depth }); }
		});
	}

	/** @returns {object} */
	function create(gl, kind, op, extra = {}) {
		const value = gl.object(kind, { deleted: false, ...extra });
		gl.record(op, { id: value.id });
		return value;
	}
	/** @returns {void} */
	function bind(gl, kind, slot, op, value, extra = {}) {
		if (value && !gl.validObject(value, kind)) return gl.invalid(gl.INVALID_OPERATION, op);
		gl[slot] = value || null;
		gl.record(op, { ...extra, id: value?.id ?? null });
	}
	/** @returns {void} */
	function remove(gl, kind, op, value) {
		if (gl.validObject(value, kind)) value.deleted = true;
		gl.record(op, { id: value?.id ?? null });
	}
	/** @returns {void} */
	function samplerParameter(gl, op, sampler, pname, param) {
		if (!gl.validObject(sampler, 'sampler')) return gl.invalid(gl.INVALID_OPERATION, op);
		sampler.parameters.set(pname, param);
		gl.record(op, { id: sampler.id, pname, param });
	}

	return { installWebGL2Api };
});
