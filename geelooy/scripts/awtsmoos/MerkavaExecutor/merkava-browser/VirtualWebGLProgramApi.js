//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory(require('./VirtualGLSL.js'));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== 'undefined' ? self : this, function(glslMod) {
	const GLSL = glslMod && glslMod.compileGLSL ? glslMod : (glslMod && glslMod.VirtualGLSL) || {};
	/**
	 * Installs shader/program lifecycle semantics. Shaders are really compiled
	 * by the from-scratch GLSL ES compiler (VirtualGLSL); linkProgram builds
	 * the executable vertex+fragment pair the software pipeline runs.
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
				// B"H: real from-scratch GLSL ES compilation (was a void-main regex).
				let result = null;
				try {
					result = GLSL.compileGLSL
						? GLSL.compileGLSL(shader.source, shader.type === this.VERTEX_SHADER ? 'vertex' : 'fragment')
						: { ok: /\bvoid\s+main\s*\(/.test(shader.source), errors: [], ir: null, attributes: [], uniforms: [], varyings: [] };
				} catch (e) {
					result = { ok: false, errors: [String(e && e.message || e)], ir: null, attributes: [], uniforms: [], varyings: [] };
				}
				shader.compiled = !!result.ok;
				shader.infoLog = result.ok ? '' : 'Merkava GLSL: ' + (result.errors || []).join('\n');
				shader.ir = result.ok ? result.ir : null;
				shader.compiledProgram = result.ok ? result : null;
				shader.stageMeta = result.ok
					? { attributes: result.attributes || [], uniforms: result.uniforms || [], varyings: result.varyings || [], functions: result.functions }
					: { attributes: [], uniforms: [], varyings: [], functions: new Map() };
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
				// B"H: build the executable linked program for the software pipeline.
				if (program.linked) {
					const vs = program.shaders.find(s => s.type === this.VERTEX_SHADER && s.compiled && !s.deleted);
					const fs = program.shaders.find(s => s.type === this.FRAGMENT_SHADER && s.compiled && !s.deleted);
					const vMeta = vs.stageMeta || { attributes: [], uniforms: [], varyings: [] };
					const fMeta = fs.stageMeta || { attributes: [], uniforms: [], varyings: [] };
					program.glsl = { vertex: vs.compiledProgram, fragment: fs.compiledProgram };
					program.attribList = vMeta.attributes || [];
					program.uniformList = [...(vMeta.uniforms || []), ...(fMeta.uniforms || [])]
						.filter((u, i, arr) => arr.findIndex(x => x.name === u.name) === i);
					program.varyingList = vMeta.varyings || [];
				} else {
					program.glsl = null;
				}
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
				if ([this.ACTIVE_UNIFORMS, this.ACTIVE_ATTRIBUTES].includes(param)) {
					if (!program.linked) return 0;
					return param === this.ACTIVE_UNIFORMS
						? (program.uniformList || []).length
						: (program.attribList || []).length;
				}
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
			isProgram(program) {
				return this.validObject(program, 'program');
			},
			isShader(shader) {
				return this.validObject(shader, 'shader');
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
