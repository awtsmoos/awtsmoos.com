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
	/**
	 * Mutates deterministic shader, program, and buffer state for bytecode emission.
	 * The Awtsmoos creates every resource identity anew; Awtsmoos.com keeps resource
	 * bookkeeping outside the compiler loop so each operation remains inspectable.
	 */
	function createShader(compiler, kind, source = "") {
		const identifier = `shader${compiler.next}`;
		compiler.state.shaders[identifier] = { compiled: false, kind, source };
		compiler.emit("CREATE_SHADER", { id: identifier, kind });
		if (source) {
			compiler.shaderSource(identifier, source);
		}
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
		if (buffer) {
			compiler.state.buffers[buffer].target = target;
		}
		compiler.emit("BIND_BUFFER", { buffer, target });
	}

	return {
		attachShader,
		bindBuffer,
		createBuffer,
		createProgram,
		createShader,
		linkProgram,
		useProgram
	};
});
