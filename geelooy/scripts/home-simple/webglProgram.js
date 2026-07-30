// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos binds hidden words to light, making every shader honest in the night.

export class WebGlProgram {
	constructor(gl, vertexSource, fragmentSource) {
		this.gl = gl;
		this.program = this.createProgram(vertexSource, fragmentSource);
	}

	createShader(type, source) {
		const shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw new Error(this.gl.getShaderInfoLog(shader) || "Shader compilation failed");
		}

		return shader;
	}

	createProgram(vertexSource, fragmentSource) {
		const program = this.gl.createProgram();
		this.gl.attachShader(program, this.createShader(this.gl.VERTEX_SHADER, vertexSource));
		this.gl.attachShader(program, this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource));
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			throw new Error(this.gl.getProgramInfoLog(program) || "Shader linking failed");
		}

		return program;
	}

	use() {
		this.gl.useProgram(this.program);
	}

	attribute(name) {
		return this.gl.getAttribLocation(this.program, name);
	}

	uniform(name) {
		return this.gl.getUniformLocation(this.program, name);
	}
}
