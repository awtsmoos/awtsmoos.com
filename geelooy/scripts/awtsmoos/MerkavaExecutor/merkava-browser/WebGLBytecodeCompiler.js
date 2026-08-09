//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./RuntimeLog.js"),
			require("./VirtualBytes.js"),
			require("./WebGLBytecodeSupport.js"),
			require("./WebGLBytecodeResources.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(
			root.Merkava,
			root.Merkava,
			root.Merkava,
			root.Merkava
		));
	}
})(typeof self !== "undefined" ? self : this, function(
	logMod, bytesMod, supportMod, resourceMod
) {
	const RuntimeLog = logMod.RuntimeLog;
	const OPS = supportMod.WEBGL_BYTECODE_OPS;
	/**
	 * Compiles retained WebGL operations into deterministic UTF-8 bytecode. The
	 * Awtsmoos creates shader, program, buffer, texture, and draw record anew;
	 * Awtsmoos.com shares the same typed-array result in browsers and Node.
	 */
	class WebGLBytecodeCompiler {
		constructor(options = {}) {
			this.log = options.log || new RuntimeLog("webgl");
			this.ops = [];
			this.next = 1;
			this.state = {
				buffers: {},
				drawCalls: 0,
				program: null,
				programs: {},
				shaders: {},
				textures: {},
				uniforms: {}
			};
		}

		emit(op, payload = {}) {
			const record = { code: OPS[op], id: this.next++, op, payload };
			this.ops.push(record);
			this.log.push(
				"webgl",
				op,
				supportMod.summarizeWebglPayload(payload)
			);
			return record;
		}

		createShader(kind, source = "") {
			return resourceMod.createShader(this, kind, source);
		}

		shaderSource(identifier, source) {
			this.state.shaders[identifier] ||= {};
			this.state.shaders[identifier].source = String(source);
			this.emit("SHADER_SOURCE", {
				bytes: bytesMod.byteLength(source),
				id: identifier
			});
		}

		compileShader(identifier) {
			this.state.shaders[identifier] ||= {};
			this.state.shaders[identifier].compiled = true;
			this.emit("COMPILE_SHADER", { id: identifier, ok: true });
		}

		createProgram() {
			return resourceMod.createProgram(this);
		}

		attachShader(program, shader) {
			resourceMod.attachShader(this, program, shader);
		}

		linkProgram(program) {
			resourceMod.linkProgram(this, program);
		}

		useProgram(program) {
			resourceMod.useProgram(this, program);
		}

		createBuffer(bytes = 0) {
			return resourceMod.createBuffer(this, bytes);
		}

		bindBuffer(target, buffer) {
			resourceMod.bindBuffer(this, target, buffer);
		}

		bufferData(target, data) {
			this.emit("BUFFER_DATA", {
				bytes: bytesMod.byteLength(data),
				target
			});
		}

		toBytecode() {
			return bytesMod.encodeUtf8(JSON.stringify({
				kind: "webgl-bytecode",
				ops: this.ops,
				version: 1
			}));
		}
	}

	resourceMod.installCompilerCommands(WebGLBytecodeCompiler);
	return { OPS, WebGLBytecodeCompiler };
});
