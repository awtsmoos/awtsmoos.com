//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	function createShader(compiler, kind, source = "") {
		const identifier = `shader${compiler.next}`;
		compiler.state.shaders[identifier] = { compiled: false, kind, source };
		compiler.emit("CREATE_SHADER", { id: identifier, kind });
		if (source) compiler.shaderSource(identifier, source);
		return identifier;
	}

	function createProgram(compiler) {
		const identifier = `program${compiler.next}`;
		compiler.state.programs[identifier] = { linked: false, shaders: [] };
		compiler.emit("CREATE_PROGRAM", { id: identifier });
		return identifier;
	}

	function createBuffer(compiler, bytes = 0) {
		const identifier = `buffer${compiler.next}`;
		compiler.state.buffers[identifier] = { bytes, target: null };
		compiler.emit("CREATE_BUFFER", { id: identifier });
		return identifier;
	}

	function attachShader(compiler, program, shader) {
		compiler.state.programs[program].shaders.push(shader);
		compiler.emit("ATTACH_SHADER", { program, shader });
	}

	function linkProgram(compiler, program) {
		compiler.state.programs[program].linked = true;
		compiler.emit("LINK_PROGRAM", { ok: true, program });
	}

	function useProgram(compiler, program) {
		compiler.state.program = program;
		compiler.emit("USE_PROGRAM", { program });
	}

	function bindBuffer(compiler, target, buffer) {
		if (buffer) compiler.state.buffers[buffer].target = target;
		compiler.emit("BIND_BUFFER", { buffer, target });
	}

	function createTexture(compiler, width = 0, height = 0) {
		const identifier = `texture${compiler.next}`;
		compiler.state.textures[identifier] = { height, width };
		compiler.emit("CREATE_TEXTURE", { id: identifier });
		return identifier;
	}

	function installCompilerCommands(Compiler) {
		Object.assign(Compiler.prototype, {
			createTexture(width = 0, height = 0) {
				return createTexture(this, width, height);
			},
			texImage2D(texture, width, height, bytes = width * height * 4) {
				this.state.textures[texture] = { bytes, height, width };
				this.emit("TEX_IMAGE_2D", { bytes, height, texture, width });
			},
			uniform(name, value) {
				this.state.uniforms[name] = value;
				this.emit("UNIFORM", { name, value });
			},
			drawArrays(mode, first, count) {
				this.state.drawCalls++;
				this.emit("DRAW_ARRAYS", {
					count, first, mode, triangles: Math.floor(count / 3)
				});
			},
			drawElements(mode, count, type, offset) {
				this.state.drawCalls++;
				this.emit("DRAW_ELEMENTS", { count, mode, offset, type });
			},
			compileFromCanvasCommands(commands = []) {
				for (const command of commands) this.lowerCanvasCommand(command);
				return this.ops;
			},
			lowerCanvasCommand(command) {
				const op = command.op || command.name || "";
				if (op.includes("drawArrays")) {
					this.drawArrays(command.mode || "TRIANGLES", command.first || 0, command.count || 3);
				} else if (op.includes("bufferData")) {
					this.bufferData(command.target || "ARRAY_BUFFER", command.data || command.bytes || 0);
				} else if (op.includes("texImage2D")) {
					this.texImage2D(command.texture || "texture0", command.width || 1, command.height || 1, command.bytes);
				} else {
					this.emit("UNIFORM", { loweredFrom: op || "unknown" });
				}
			}
		});
	}

	return {
		attachShader, bindBuffer, createBuffer, createProgram, createShader,
		installCompilerCommands, linkProgram, useProgram
	};
});
