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
	 * Installs shader/program lifecycle semantics. The virtual compiler does not
	 * yet implement full GLSL ES parsing, but it now distinguishes malformed
	 * sources, compile/link failure, deletion, attached shaders, and invalid use.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLProgramApi(Context) {
		Object.assign(Context.prototype, {
			createShader(type) {
				if (![this.VERTEX_SHADER, this.FRAGMENT_SHADER].includes(type)) return this.invalid(this.INVALID_ENUM, 'createShader', { type });
				const shader = this.object('shader', { type, source: '', compiled: false, deleted: false, infoLog: '' });
				this.record('createShader', { id: shader.id, type });
				return shader;
			},
			shaderSource(shader, source) {
				if (!this.validObject(shader, 'shader')) return this.invalid(this.INVALID_VALUE, 'shaderSource');
				shader.source = String(source ?? '');
				this.record('shaderSource', { id: shader.id, length: shader.source.length });
			},
			compileShader(shader) {
				if (!this.validObject(shader, 'shader')) return this.invalid(this.INVALID_VALUE, 'compileShader');
				shader.compiled = /\bvoid\s+main\s*\(/.test(shader.source);
				shader.infoLog = shader.compiled ? '' : 'Merkava GLSL preflight: missing void main().';
				this.record('compileShader', { id: shader.id, compiled: shader.compiled });
			},
			getShaderParameter(shader, param) {
				if (!this.validObject(shader, 'shader')) return null;
				if (param === this.COMPILE_STATUS) return !!shader.compiled;
				if (param === this.DELETE_STATUS) return !!shader.deleted;
				if (param === this.SHADER_TYPE) return shader.type;
				this.invalid(this.INVALID_ENUM, 'getShaderParameter', { param });
				return null;
			},
			getShaderInfoLog(shader) {
				return this.validObject(shader, 'shader') ? shader.infoLog : '';
			},
			deleteShader(shader) {
				if (this.validObject(shader, 'shader')) shader.deleted = true;
				this.record('deleteShader', { id: shader?.id ?? null });
			},
			createProgram() {
				const program = this.object('program', { shaders: [], linked: false, validated: false, deleted: false, attribs: {}, infoLog: '' });
				this.record('createProgram', { id: program.id });
				return program;
			},
			attachShader(program, shader) {
				if (!this.validObject(program, 'program') || !this.validObject(shader, 'shader')) return this.invalid(this.INVALID_VALUE, 'attachShader');
				if (program.shaders.includes(shader)) return this.invalid(this.INVALID_OPERATION, 'attachShader');
				program.shaders.push(shader);
				this.record('attachShader', { program: program.id, shader: shader.id });
			},
			linkProgram(program) {
				if (!this.validObject(program, 'program')) return this.invalid(this.INVALID_VALUE, 'linkProgram');
				const types = new Set(program.shaders.filter(shader => shader.compiled && !shader.deleted).map(shader => shader.type));
				program.linked = types.has(this.VERTEX_SHADER) && types.has(this.FRAGMENT_SHADER);
				program.infoLog = program.linked ? '' : 'Merkava link preflight: compiled vertex and fragment shaders required.';
				this.record('linkProgram', { program: program.id, linked: program.linked });
			},
			validateProgram(program) {
				if (!this.validObject(program, 'program')) return this.invalid(this.INVALID_VALUE, 'validateProgram');
				program.validated = !!program.linked;
				this.record('validateProgram', { program: program.id, validated: program.validated });
			},
			getProgramParameter(program, param) {
				if (!this.validObject(program, 'program')) return null;
				if (param === this.LINK_STATUS) return !!program.linked;
				if (param === this.VALIDATE_STATUS) return !!program.validated;
				if (param === this.DELETE_STATUS) return !!program.deleted;
				if (param === this.ATTACHED_SHADERS) return program.shaders.length;
				if ([this.ACTIVE_UNIFORMS, this.ACTIVE_ATTRIBUTES].includes(param)) return 0;
				this.invalid(this.INVALID_ENUM, 'getProgramParameter', { param });
				return null;
			},
			getProgramInfoLog(program) {
				return this.validObject(program, 'program') ? program.infoLog : '';
			},
			useProgram(program) {
				if (program && (!this.validObject(program, 'program') || !program.linked)) return this.invalid(this.INVALID_OPERATION, 'useProgram');
				this.currentProgram = program || null;
				this.record('useProgram', { program: program?.id ?? null });
			},
			deleteProgram(program) {
				if (this.validObject(program, 'program')) program.deleted = true;
				if (this.currentProgram === program) this.currentProgram = null;
				this.record('deleteProgram', { id: program?.id ?? null });
			},
			getAttribLocation(program, name) {
				if (!this.validObject(program, 'program') || !program.linked) return -1;
				const key = String(name ?? '');
				if (!(key in program.attribs)) program.attribs[key] = Object.keys(program.attribs).length;
				return program.attribs[key];
			}
		});
	}

	return { installWebGLProgramApi };
});
