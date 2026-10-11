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
	const SCALARS = Object.freeze({
		uniform1f: 1, uniform2f: 2, uniform3f: 3, uniform4f: 4,
		uniform1i: 1, uniform2i: 2, uniform3i: 3, uniform4i: 4,
		uniform1ui: 1, uniform2ui: 2, uniform3ui: 3, uniform4ui: 4
	});
	const VECTORS = Object.freeze([
		'uniform1fv', 'uniform2fv', 'uniform3fv', 'uniform4fv',
		'uniform1iv', 'uniform2iv', 'uniform3iv', 'uniform4iv',
		'uniform1uiv', 'uniform2uiv', 'uniform3uiv', 'uniform4uiv'
	]);
	const MATRICES = Object.freeze([
		'uniformMatrix2fv', 'uniformMatrix3fv', 'uniformMatrix4fv',
		'uniformMatrix2x3fv', 'uniformMatrix2x4fv', 'uniformMatrix3x2fv',
		'uniformMatrix3x4fv', 'uniformMatrix4x2fv', 'uniformMatrix4x3fv'
	]);

	/**
	 * Installs the complete scalar/vector/matrix uniform call surface shared by
	 * WebGL 1 and WebGL 2. Values are copied into the command journal so later
	 * native lowering cannot observe caller-side typed-array mutation.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLUniformApi(Context) {
		Context.prototype.getUniformLocation = function(program, name) {
			if (!this.validObject(program, 'program') || !program.linked) return null;
			const uname = String(name ?? '');
			// B"H: return null for inactive/missing uniforms (WebGL spec).
			// Strip [0] suffix for array base lookup.
			const base = uname.replace(/\[0\]$/, '');
			const list = program.uniformList || [];
			const found = list.some(u => {
				const un = typeof u === 'string' ? u : (u.name || '');
				return un === uname || un === base || un.replace(/\[0\]$/, '') === base;
			});
			if (!found) return null;
			const location = { program: program.id, name: uname };
			this.record('getUniformLocation', location);
			return location;
		};
		for (const [name, arity] of Object.entries(SCALARS)) {
			Context.prototype[name] = function(location, ...values) {
				this.recordUniform(name, location, values.slice(0, arity));
			};
		}
		for (const name of VECTORS) {
			Context.prototype[name] = function(location, values) {
				this.recordUniform(name, location, Array.from(values || []));
			};
		}
		for (const name of MATRICES) {
			Context.prototype[name] = function(location, transpose, values) {
				if (transpose) return this.invalid(this.INVALID_VALUE, name, { transpose: true });
				this.recordUniform(name, location, Array.from(values || []), { transpose: false });
			};
		}
	}

	return { installWebGLUniformApi };
});
